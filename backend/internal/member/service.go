package member

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoleValidator interface {
	Get(ctx context.Context, id string) (model.HotelRole, error)
}

// ownerRoleSlug is the seeded owner role's slug (see role.SlugOwner). Kept
// as a local literal rather than importing the role package, since role
// already imports member for MemberRepo.CountByRole.
const ownerRoleSlug = "owner"

type UserFinder interface {
	GetByPhone(ctx context.Context, phone string) (model.User, error)
}

type MemberService interface {
	List(ctx context.Context, hotelID string, pagination model.Pagination) (ListMembersResponse, error)
	Add(ctx context.Context, hotelID, invitedBy string, req *AddMemberRequest) (model.MemberDetail, error)
	Update(ctx context.Context, id, hotelID string, req *UpdateMemberRequest) (model.Member, error)
	Remove(ctx context.Context, id, hotelID string) error
}

type memberService struct {
	slog  *slog.Logger
	repo  MemberRepo
	roles RoleValidator
	users UserFinder
	DB    *pgxpool.Pool
}

func NewMemberService(
	slog *slog.Logger,
	repo MemberRepo,
	roles RoleValidator,
	users UserFinder,
	db *pgxpool.Pool,
) MemberService {
	return &memberService{
		slog:  slog,
		repo:  repo,
		roles: roles,
		users: users,
		DB:    db,
	}
}
func (s *memberService) List(ctx context.Context, hotelID string, pagination model.Pagination) (ListMembersResponse, error) {
	if err := pagination.Validate(); err != nil {
		return ListMembersResponse{}, err
	}

	members, total, err := s.repo.ListByHotel(ctx, hotelID, pagination)
	if err != nil {
		return ListMembersResponse{}, err
	}

	return ListMembersResponse{
		Members: members,
		Page:    pagination.Page,
		Limit:   pagination.Limit,
		Total:   total,
	}, nil
}

func (s *memberService) Add(ctx context.Context, hotelID, invitedBy string, req *AddMemberRequest) (model.MemberDetail, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.MemberDetail{}, err
	}

	user, err := s.users.GetByPhone(ctx, req.Phone)
	if err != nil {
		return model.MemberDetail{}, err
	}

	role, err := s.roles.Get(ctx, req.RoleID)
	if err != nil {
		return model.MemberDetail{}, err
	}
	if role.HotelID != nil && *role.HotelID != hotelID {
		return model.MemberDetail{}, apperr.ErrRoleNotFound
	}

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return model.MemberDetail{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	now := time.Now()
	created, err := s.repo.Create(ctx, &model.Member{
		HotelID:   hotelID,
		UserID:    user.ID,
		RoleID:    role.ID,
		Status:    model.MemberStatusActive,
		InvitedBy: &invitedBy,
		JoinedAt:  &now,
	}, tx)
	if err != nil {
		s.slog.Error("failed to add member", "hotel_id", hotelID, "error", err)
		return model.MemberDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return model.MemberDetail{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.slog.Info("member added", "hotel_id", hotelID, "member_id", created.ID, "user_id", user.ID)

	return model.MemberDetail{
		Member:    created,
		UserName:  user.Name,
		UserEmail: user.Email,
		UserPhone: user.PhoneNumber,
		UserImage: user.Image,
		RoleName:  role.Name,
		RoleSlug:  role.Slug,
	}, nil
}

func (s *memberService) Update(ctx context.Context, id, hotelID string, req *UpdateMemberRequest) (model.Member, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Member{}, err
	}

	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		return model.Member{}, err
	}
	if existing.HotelID != hotelID {
		return model.Member{}, apperr.ErrMemberNotFound
	}

	currentRole, err := s.roles.Get(ctx, existing.RoleID)
	if err != nil {
		return model.Member{}, err
	}

	losingOwnerRole := currentRole.Slug == ownerRoleSlug &&
		((req.RoleID != nil && *req.RoleID != existing.RoleID) ||
			(req.Status != nil && *req.Status != string(model.MemberStatusActive)))

	if losingOwnerRole {
		isLast, err := s.isLastActiveOwner(ctx, hotelID, existing.RoleID)
		if err != nil {
			return model.Member{}, err
		}
		if isLast {
			return model.Member{}, apperr.ErrLastOwner
		}
	}

	if req.RoleID != nil {
		role, err := s.roles.Get(ctx, *req.RoleID)
		if err != nil {
			return model.Member{}, err
		}
		if role.HotelID != nil && *role.HotelID != hotelID {
			return model.Member{}, apperr.ErrRoleNotFound
		}
		existing.RoleID = role.ID
	}

	if req.Status != nil {
		existing.Status = model.MemberStatus(*req.Status)
	}

	updated, err := s.repo.Update(ctx, &existing)
	if err != nil {
		s.slog.Error("failed to update member", "member_id", id, "error", err)
		return model.Member{}, err
	}

	s.slog.Info("member updated", "member_id", id, "hotel_id", hotelID)

	return updated, nil
}

func (s *memberService) Remove(ctx context.Context, id, hotelID string) error {
	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		return err
	}
	if existing.HotelID != hotelID {
		return apperr.ErrMemberNotFound
	}

	currentRole, err := s.roles.Get(ctx, existing.RoleID)
	if err != nil {
		return err
	}
	if currentRole.Slug == ownerRoleSlug {
		isLast, err := s.isLastActiveOwner(ctx, hotelID, existing.RoleID)
		if err != nil {
			return err
		}
		if isLast {
			return apperr.ErrLastOwner
		}
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		s.slog.Error("failed to remove member", "member_id", id, "error", err)
		return err
	}

	s.slog.Info("member removed", "member_id", id, "hotel_id", hotelID)

	return nil
}

func (s *memberService) isLastActiveOwner(ctx context.Context, hotelID, roleID string) (bool, error) {
	counts, err := s.repo.CountByRole(ctx, hotelID)
	if err != nil {
		return false, err
	}

	return counts[roleID] <= 1, nil
}
