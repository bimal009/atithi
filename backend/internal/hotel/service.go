package hotel

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/bimal009/atithi/internal/member"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/role"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelService interface {
	Create(ctx context.Context, userID string, req *CreateHotelRequest) (model.Hotel, error)
	Get(ctx context.Context, id, userID string) (model.Hotel, error)
	GetBySlug(ctx context.Context, slug, userID string) (model.Hotel, error)
	GetAll(ctx context.Context, userID string) ([]model.Hotel, error)
	Update(ctx context.Context, id, userID string, req *UpdateHotelRequest) (model.Hotel, error)
	Delete(ctx context.Context, id, userID string) error
	SlugAvailable(ctx context.Context, slug string) (bool, error)
}

type hotelService struct {
	slog    *slog.Logger
	repo    HotelRepo
	members member.MemberRepo
	roles   role.RoleRepo
	DB      *pgxpool.Pool
}

func NewHotelService(
	slog *slog.Logger,
	repo HotelRepo,
	members member.MemberRepo,
	roles role.RoleRepo,
	db *pgxpool.Pool,
) HotelService {
	return &hotelService{
		slog:    slog,
		repo:    repo,
		members: members,
		roles:   roles,
		DB:      db,
	}
}

// Create writes the hotel and the creator's owner membership together. A hotel
// with no members would be invisible to everyone, including the person who
// just made it, so the two must commit as one.
func (s *hotelService) Create(ctx context.Context, userID string, req *CreateHotelRequest) (model.Hotel, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Hotel{}, err
	}

	exists, err := s.repo.SlugExists(ctx, req.Slug)
	if err != nil {
		return model.Hotel{}, err
	}
	if exists {
		return model.Hotel{}, apperr.ErrHotelSlugExists
	}

	ownerRole, err := s.roles.GetBySlug(ctx, nil, role.SlugOwner)
	if err != nil {
		s.slog.Error("owner role missing", "error", err)
		return model.Hotel{}, fmt.Errorf("failed to resolve owner role: %w", err)
	}

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return model.Hotel{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	newHotel := &model.Hotel{
		ID:          uuid.NewString(),
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		LogoURL:     req.LogoURL,
		Address:     req.Address,
		City:        req.City,
		PhoneNumber: req.PhoneNumber,
		Email:       req.Email,
		IsActive:    true,
	}

	createdHotel, err := s.repo.Create(ctx, tx, newHotel)
	if err != nil {
		s.slog.Error("failed to create hotel", "slug", req.Slug, "error", err)
		return model.Hotel{}, err
	}

	now := time.Now()
	if _, err := s.members.Create(ctx, &model.Member{
		HotelID:  createdHotel.ID,
		UserID:   userID,
		RoleID:   ownerRole.ID,
		Status:   model.MemberStatusActive,
		JoinedAt: &now,
	}, tx); err != nil {
		s.slog.Error("failed to create owner membership", "hotel_id", createdHotel.ID, "error", err)
		return model.Hotel{}, fmt.Errorf("failed to create owner membership: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return model.Hotel{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.slog.Info("hotel created", "hotel_id", createdHotel.ID, "slug", createdHotel.Slug, "owner", userID)

	return createdHotel, nil
}

func (s *hotelService) Get(ctx context.Context, id, userID string) (model.Hotel, error) {
	return s.repo.Get(ctx, id, userID)
}

func (s *hotelService) GetBySlug(ctx context.Context, slug, userID string) (model.Hotel, error) {
	return s.repo.GetBySlug(ctx, slug, userID)
}

func (s *hotelService) GetAll(ctx context.Context, userID string) ([]model.Hotel, error) {
	return s.repo.ListForUser(ctx, userID)
}

func (s *hotelService) Update(ctx context.Context, id, userID string, req *UpdateHotelRequest) (model.Hotel, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Hotel{}, err
	}

	existingHotel, err := s.repo.Get(ctx, id, userID)
	if err != nil {
		return model.Hotel{}, err
	}

	if req.Slug != nil && *req.Slug != existingHotel.Slug {
		exists, err := s.repo.SlugExists(ctx, *req.Slug)
		if err != nil {
			return model.Hotel{}, err
		}
		if exists {
			return model.Hotel{}, apperr.ErrHotelSlugExists
		}
		existingHotel.Slug = *req.Slug
	}

	if req.Name != nil {
		existingHotel.Name = *req.Name
	}
	if req.Description != nil {
		existingHotel.Description = req.Description
	}
	if req.LogoURL != nil {
		existingHotel.LogoURL = req.LogoURL
	}
	if req.Address != nil {
		existingHotel.Address = *req.Address
	}
	if req.City != nil {
		existingHotel.City = req.City
	}
	if req.PhoneNumber != nil {
		existingHotel.PhoneNumber = *req.PhoneNumber
	}
	if req.Email != nil {
		existingHotel.Email = req.Email
	}
	if req.IsActive != nil {
		existingHotel.IsActive = *req.IsActive
	}

	updatedHotel, err := s.repo.Update(ctx, &existingHotel, userID)
	if err != nil {
		s.slog.Error("failed to update hotel", "hotel_id", id, "error", err)
		return model.Hotel{}, err
	}

	s.slog.Info("hotel updated", "hotel_id", updatedHotel.ID)

	return updatedHotel, nil
}

// SlugAvailable is unauthenticated by nature of the check itself: slugs are
// globally unique, so availability cannot depend on which hotels the caller
// can see.
func (s *hotelService) SlugAvailable(ctx context.Context, slug string) (bool, error) {
	if !SlugFormat.MatchString(slug) {
		return false, nil
	}

	exists, err := s.repo.SlugExists(ctx, slug)
	if err != nil {
		return false, err
	}

	return !exists, nil
}

func (s *hotelService) Delete(ctx context.Context, id, userID string) error {
	if err := s.repo.Delete(ctx, id, userID); err != nil {
		s.slog.Error("failed to delete hotel", "hotel_id", id, "error", err)
		return err
	}

	s.slog.Info("hotel deleted", "hotel_id", id)

	return nil
}
