package roomtypes

import (
	"context"
	"fmt"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type RoomTypeService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateRoomTypeRequest) (model.RoomType, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.RoomType, error)
	GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListRoomTypesResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateRoomTypeRequest) (model.RoomType, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type roomTypeService struct {
	slog     *slog.Logger
	repo     RoomTypeRepo
	notifier notifications.Notifier
}

func NewRoomTypeService(slog *slog.Logger, repo RoomTypeRepo, notifier notifications.Notifier) RoomTypeService {
	return &roomTypeService{
		slog:     slog,
		repo:     repo,
		notifier: notifier,
	}
}

func (s *roomTypeService) Create(ctx context.Context, hotelID, userID string, req *CreateRoomTypeRequest) (model.RoomType, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.RoomType{}, err
	}

	amenities := req.Amenities
	if amenities == nil {
		amenities = []string{}
	}

	restrictions := req.Restrictions
	if restrictions == nil {
		restrictions = []string{}
	}

	newRoomType := &model.RoomType{
		ID:            uuid.NewString(),
		HotelID:       hotelID,
		Name:          req.Name,
		BasePrice:     req.BasePrice,
		BillingTypeID: req.BillingTypeID,
		PricingLabel:  req.PricingLabel,
		Capacity:      req.Capacity,
		Description:   req.Description,
		Amenities:     amenities,
		Restrictions:  restrictions,
	}

	created, err := s.repo.Create(ctx, newRoomType, userID)
	if err != nil {
		s.slog.Error("failed to create room type", "hotel_id", hotelID, "error", err)
		return model.RoomType{}, err
	}

	s.slog.Info("room type created", "room_type_id", created.ID, "hotel_id", hotelID)

	s.notifier.Notify(ctx, hotelID, model.NotifRoomTypeCreated, fmt.Sprintf("Room type '%s' added", created.Name), nil)

	return created, nil
}

func (s *roomTypeService) Get(ctx context.Context, id, hotelID, userID string) (model.RoomType, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *roomTypeService) GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListRoomTypesResponse, error) {
	if err := pagination.Validate(); err != nil {
		return ListRoomTypesResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, pagination)
	if err != nil {
		return ListRoomTypesResponse{}, err
	}

	return ListRoomTypesResponse{
		RoomTypes: list,
		Page:      pagination.Page,
		Limit:     pagination.Limit,
		Total:     total,
	}, nil
}

func (s *roomTypeService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateRoomTypeRequest) (model.RoomType, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.RoomType{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.RoomType{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.BasePrice != nil {
		existing.BasePrice = *req.BasePrice
	}
	if req.BillingTypeID != nil {
		existing.BillingTypeID = *req.BillingTypeID
	}
	if req.PricingLabel != nil {
		existing.PricingLabel = req.PricingLabel
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

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update room type", "room_type_id", id, "error", err)
		return model.RoomType{}, err
	}

	s.slog.Info("room type updated", "room_type_id", updated.ID)

	s.notifier.Notify(ctx, hotelID, model.NotifRoomTypeUpdated, fmt.Sprintf("Room type '%s' updated", updated.Name), nil)

	return updated, nil
}

func (s *roomTypeService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete room type", "room_type_id", id, "error", err)
		return err
	}

	s.slog.Info("room type deleted", "room_type_id", id)

	s.notifier.Notify(ctx, hotelID, model.NotifRoomTypeDeleted, "Room type removed", nil)

	return nil
}
