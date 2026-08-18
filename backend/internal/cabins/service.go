package cabins

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type CabinService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateCabinRequest) (model.Cabin, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Cabin, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListCabinsQuery) (ListCabinsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateCabinRequest) (model.Cabin, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateCabinStatusRequest) (model.Cabin, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type cabinService struct {
	slog *slog.Logger
	repo CabinRepo
}

func NewCabinService(slog *slog.Logger, repo CabinRepo) CabinService {
	return &cabinService{slog: slog, repo: repo}
}

func (s *cabinService) Create(ctx context.Context, hotelID, userID string, req *CreateCabinRequest) (model.Cabin, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Cabin{}, err
	}

	amenities := req.Amenities
	if amenities == nil {
		amenities = []string{}
	}

	restrictions := req.Restrictions
	if restrictions == nil {
		restrictions = []string{}
	}

	images := req.Images
	if images == nil {
		images = []string{}
	}

	newCabin := &model.Cabin{
		ID:            uuid.NewString(),
		HotelID:       hotelID,
		Name:          req.Name,
		Number:        req.Number,
		BasePrice:     req.BasePrice,
		BillingTypeID: &req.BillingTypeID,
		Capacity:      req.Capacity,
		Description:   req.Description,
		Amenities:     amenities,
		Restrictions:  restrictions,
		Status:        StatusAvailable,
		Images:        images,
	}

	created, err := s.repo.Create(ctx, newCabin, userID)
	if err != nil {
		s.slog.Error("failed to create cabin", "hotel_id", hotelID, "error", err)
		return model.Cabin{}, err
	}

	s.slog.Info("cabin created", "cabin_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *cabinService) Get(ctx context.Context, id, hotelID, userID string) (model.Cabin, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *cabinService) GetAll(ctx context.Context, hotelID, userID string, query ListCabinsQuery) (ListCabinsResponse, error) {
	if err := validator.ValidateStruct(&query); err != nil {
		return ListCabinsResponse{}, err
	}
	if err := query.Pagination.Validate(); err != nil {
		return ListCabinsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.Status, query.Pagination)
	if err != nil {
		return ListCabinsResponse{}, err
	}

	return ListCabinsResponse{
		Cabins: list,
		Page:   query.Pagination.Page,
		Limit:  query.Pagination.Limit,
		Total:  total,
	}, nil
}

func (s *cabinService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateCabinRequest) (model.Cabin, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Cabin{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Cabin{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Number != nil {
		existing.Number = *req.Number
	}
	if req.BasePrice != nil {
		existing.BasePrice = *req.BasePrice
	}
	if req.BillingTypeID != nil {
		existing.BillingTypeID = req.BillingTypeID
	}
	if req.Capacity != nil {
		existing.Capacity = *req.Capacity
	}
	if req.Description != nil {
		existing.Description = req.Description
	}
	if req.Amenities != nil {
		existing.Amenities = req.Amenities
	}
	if req.Restrictions != nil {
		existing.Restrictions = req.Restrictions
	}
	if req.Images != nil {
		existing.Images = req.Images
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update cabin", "cabin_id", id, "error", err)
		return model.Cabin{}, err
	}

	s.slog.Info("cabin updated", "cabin_id", updated.ID)

	return updated, nil
}

func (s *cabinService) UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateCabinStatusRequest) (model.Cabin, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Cabin{}, err
	}

	updated, err := s.repo.UpdateStatus(ctx, id, hotelID, userID, req.Status)
	if err != nil {
		s.slog.Error("failed to update cabin status", "cabin_id", id, "error", err)
		return model.Cabin{}, err
	}

	return updated, nil
}

func (s *cabinService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete cabin", "cabin_id", id, "error", err)
		return err
	}

	s.slog.Info("cabin deleted", "cabin_id", id)

	return nil
}
