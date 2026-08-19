package menusets

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type MenuSetService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateMenuSetRequest) (model.MenuSet, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.MenuSet, error)
	GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListMenuSetsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateMenuSetRequest) (model.MenuSet, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type menuSetService struct {
	slog *slog.Logger
	repo MenuSetRepo
}

func NewMenuSetService(slog *slog.Logger, repo MenuSetRepo) MenuSetService {
	return &menuSetService{slog: slog, repo: repo}
}

func (s *menuSetService) Create(ctx context.Context, hotelID, userID string, req *CreateMenuSetRequest) (model.MenuSet, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.MenuSet{}, err
	}

	available := true
	if req.Available != nil {
		available = *req.Available
	}

	newMenuSet := &model.MenuSet{
		ID:          uuid.NewString(),
		HotelID:     hotelID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Available:   available,
	}

	created, err := s.repo.Create(ctx, newMenuSet, req.Items, userID)
	if err != nil {
		s.slog.Error("failed to create menu set", "hotel_id", hotelID, "error", err)
		return model.MenuSet{}, err
	}

	s.slog.Info("menu set created", "menu_set_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *menuSetService) Get(ctx context.Context, id, hotelID, userID string) (model.MenuSet, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *menuSetService) GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListMenuSetsResponse, error) {
	if err := pagination.Validate(); err != nil {
		return ListMenuSetsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, pagination)
	if err != nil {
		return ListMenuSetsResponse{}, err
	}

	return ListMenuSetsResponse{
		MenuSets: list,
		Page:     pagination.Page,
		Limit:    pagination.Limit,
		Total:    total,
	}, nil
}

func (s *menuSetService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateMenuSetRequest) (model.MenuSet, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.MenuSet{}, err
	}

	updated, err := s.repo.Update(ctx, id, hotelID, userID, req.Name, req.Description, req.Price, req.Available, req.Items)
	if err != nil {
		s.slog.Error("failed to update menu set", "menu_set_id", id, "error", err)
		return model.MenuSet{}, err
	}

	s.slog.Info("menu set updated", "menu_set_id", updated.ID)

	return updated, nil
}

func (s *menuSetService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete menu set", "menu_set_id", id, "error", err)
		return err
	}

	s.slog.Info("menu set deleted", "menu_set_id", id)

	return nil
}
