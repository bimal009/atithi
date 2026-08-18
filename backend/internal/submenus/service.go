package submenus

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type SubMenuService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateSubMenuRequest) (model.SubMenu, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.SubMenu, error)
	GetAll(ctx context.Context, hotelID, userID string) ([]model.SubMenu, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateSubMenuRequest) (model.SubMenu, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type subMenuService struct {
	slog *slog.Logger
	repo SubMenuRepo
}

func NewSubMenuService(slog *slog.Logger, repo SubMenuRepo) SubMenuService {
	return &subMenuService{slog: slog, repo: repo}
}

func (s *subMenuService) Create(ctx context.Context, hotelID, userID string, req *CreateSubMenuRequest) (model.SubMenu, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.SubMenu{}, err
	}

	newSubMenu := &model.SubMenu{
		ID:          uuid.NewString(),
		HotelID:     hotelID,
		Name:        req.Name,
		Description: req.Description,
	}

	created, err := s.repo.Create(ctx, newSubMenu, userID)
	if err != nil {
		s.slog.Error("failed to create sub-menu", "hotel_id", hotelID, "error", err)
		return model.SubMenu{}, err
	}

	s.slog.Info("sub-menu created", "sub_menu_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *subMenuService) Get(ctx context.Context, id, hotelID, userID string) (model.SubMenu, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *subMenuService) GetAll(ctx context.Context, hotelID, userID string) ([]model.SubMenu, error) {
	return s.repo.ListForHotel(ctx, hotelID, userID)
}

func (s *subMenuService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateSubMenuRequest) (model.SubMenu, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.SubMenu{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.SubMenu{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Description != nil {
		existing.Description = req.Description
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update sub-menu", "sub_menu_id", id, "error", err)
		return model.SubMenu{}, err
	}

	s.slog.Info("sub-menu updated", "sub_menu_id", updated.ID)

	return updated, nil
}

func (s *subMenuService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete sub-menu", "sub_menu_id", id, "error", err)
		return err
	}

	s.slog.Info("sub-menu deleted", "sub_menu_id", id)

	return nil
}
