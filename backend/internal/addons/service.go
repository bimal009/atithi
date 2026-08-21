package addons

import (
	"context"
	"fmt"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type AddOnService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateAddOnRequest) (model.AddOn, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.AddOn, error)
	GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListAddOnsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateAddOnRequest) (model.AddOn, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type addOnService struct {
	slog     *slog.Logger
	repo     AddOnRepo
	notifier notifications.Notifier
}

func NewAddOnService(slog *slog.Logger, repo AddOnRepo, notifier notifications.Notifier) AddOnService {
	return &addOnService{slog: slog, repo: repo, notifier: notifier}
}

func (s *addOnService) Create(ctx context.Context, hotelID, userID string, req *CreateAddOnRequest) (model.AddOn, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.AddOn{}, err
	}

	available := true
	if req.Available != nil {
		available = *req.Available
	}

	newAddOn := &model.AddOn{
		ID:        uuid.NewString(),
		HotelID:   hotelID,
		Price:     req.Price,
		Available: available,
	}

	created, err := s.repo.CreateWithDish(ctx, req.Name, req.ImageURL, newAddOn, userID)
	if err != nil {
		s.slog.Error("failed to create add-on", "hotel_id", hotelID, "error", err)
		return model.AddOn{}, err
	}

	s.slog.Info("add-on created", "add_on_id", created.ID, "hotel_id", hotelID, "dish_id", created.DishID)

	s.notifier.Notify(ctx, hotelID, model.NotifAddOnCreated, fmt.Sprintf("Add-on '%s' added", created.Name), nil)

	return created, nil
}

func (s *addOnService) Get(ctx context.Context, id, hotelID, userID string) (model.AddOn, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *addOnService) GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListAddOnsResponse, error) {
	if err := pagination.Validate(); err != nil {
		return ListAddOnsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, pagination)
	if err != nil {
		return ListAddOnsResponse{}, err
	}

	return ListAddOnsResponse{
		AddOns: list,
		Page:   pagination.Page,
		Limit:  pagination.Limit,
		Total:  total,
	}, nil
}

func (s *addOnService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateAddOnRequest) (model.AddOn, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.AddOn{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.AddOn{}, err
	}

	if req.Price != nil {
		existing.Price = *req.Price
	}
	if req.Available != nil {
		existing.Available = *req.Available
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update add-on", "add_on_id", id, "error", err)
		return model.AddOn{}, err
	}

	s.slog.Info("add-on updated", "add_on_id", updated.ID)

	s.notifier.Notify(ctx, hotelID, model.NotifAddOnUpdated, fmt.Sprintf("Add-on '%s' updated", updated.Name), nil)

	return updated, nil
}

func (s *addOnService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete add-on", "add_on_id", id, "error", err)
		return err
	}

	s.slog.Info("add-on deleted", "add_on_id", id)

	s.notifier.Notify(ctx, hotelID, model.NotifAddOnDeleted, "Add-on removed", nil)

	return nil
}
