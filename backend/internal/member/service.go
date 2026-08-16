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

type UserFinder interface {
	GetByPhone(ctx context.Context, phone string) (model.User, error)
}

type MemberService interface {
	List(ctx context.Context, hotelID string, pagination model.Pagination) (ListMembersResponse, error)
	Add(ctx context.Context, hotelID, invitedBy string, req *AddMemberRequest) (model.MemberDetail, error)
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
