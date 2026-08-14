package hotel

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type HotelService interface {
	Create(ctx context.Context, req *CreateHotelRequest) (model.Hotel, error)
	Get(ctx context.Context, id string) (model.Hotel, error)
	GetBySlug(ctx context.Context, slug string) (model.Hotel, error)
	GetAll(ctx context.Context) ([]model.Hotel, error)
	Update(ctx context.Context, id string, req *UpdateHotelRequest) (model.Hotel, error)
	Delete(ctx context.Context, id string) error
}

type hotelService struct {
	slog *slog.Logger
	repo HotelRepo
}

func NewHotelService(slog *slog.Logger, repo HotelRepo) HotelService {
	return &hotelService{
		slog: slog,
		repo: repo,
	}
}

func (s *hotelService) Create(ctx context.Context, req *CreateHotelRequest) (model.Hotel, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Hotel{}, err
	}

	if _, err := s.repo.GetBySlug(ctx, req.Slug); err == nil {
		return model.Hotel{}, apperr.ErrHotelSlugExists
	} else if !errors.Is(err, apperr.ErrHotelNotFound) {
		return model.Hotel{}, err
	}

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

	createdHotel, err := s.repo.Create(ctx, newHotel)
	if err != nil {
		s.slog.Error("failed to create hotel", "slug", req.Slug, "error", err)
		return model.Hotel{}, fmt.Errorf("failed to create hotel: %w", err)
	}

	s.slog.Info("hotel created", "hotel_id", createdHotel.ID, "slug", createdHotel.Slug)

	return createdHotel, nil
}

func (s *hotelService) Get(ctx context.Context, id string) (model.Hotel, error) {
	return s.repo.Get(ctx, id)
}

func (s *hotelService) GetBySlug(ctx context.Context, slug string) (model.Hotel, error) {
	return s.repo.GetBySlug(ctx, slug)
}

func (s *hotelService) GetAll(ctx context.Context) ([]model.Hotel, error) {
	return s.repo.GetAll(ctx)
}

func (s *hotelService) Update(ctx context.Context, id string, req *UpdateHotelRequest) (model.Hotel, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Hotel{}, err
	}

	existingHotel, err := s.repo.Get(ctx, id)
	if err != nil {
		return model.Hotel{}, err
	}

	if req.Slug != nil && *req.Slug != existingHotel.Slug {
		if other, err := s.repo.GetBySlug(ctx, *req.Slug); err == nil && other.ID != id {
			return model.Hotel{}, apperr.ErrHotelSlugExists
		} else if err != nil && !errors.Is(err, apperr.ErrHotelNotFound) {
			return model.Hotel{}, err
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

	updatedHotel, err := s.repo.Update(ctx, &existingHotel)
	if err != nil {
		s.slog.Error("failed to update hotel", "hotel_id", id, "error", err)
		return model.Hotel{}, fmt.Errorf("failed to update hotel: %w", err)
	}

	s.slog.Info("hotel updated", "hotel_id", updatedHotel.ID)

	return updatedHotel, nil
}

func (s *hotelService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		s.slog.Error("failed to delete hotel", "hotel_id", id, "error", err)
		return err
	}

	s.slog.Info("hotel deleted", "hotel_id", id)

	return nil
}
