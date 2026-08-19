package categories

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type CategoryService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateCategoryRequest) (model.Category, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Category, error)
	GetAll(ctx context.Context, hotelID, userID string) ([]model.Category, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateCategoryRequest) (model.Category, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type categoryService struct {
	slog *slog.Logger
	repo CategoryRepo
}

func NewCategoryService(slog *slog.Logger, repo CategoryRepo) CategoryService {
	return &categoryService{slog: slog, repo: repo}
}

func (s *categoryService) Create(ctx context.Context, hotelID, userID string, req *CreateCategoryRequest) (model.Category, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Category{}, err
	}

	newCategory := &model.Category{
		ID:        uuid.NewString(),
		HotelID:   hotelID,
		Name:      req.Name,
		SubMenuID: &req.SubMenuID,
	}

	created, err := s.repo.Create(ctx, newCategory, userID)
	if err != nil {
		s.slog.Error("failed to create category", "hotel_id", hotelID, "error", err)
		return model.Category{}, err
	}

	s.slog.Info("category created", "category_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *categoryService) Get(ctx context.Context, id, hotelID, userID string) (model.Category, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *categoryService) GetAll(ctx context.Context, hotelID, userID string) ([]model.Category, error) {
	return s.repo.ListForHotel(ctx, hotelID, userID)
}

func (s *categoryService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateCategoryRequest) (model.Category, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Category{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Category{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.SubMenuID != nil {
		existing.SubMenuID = req.SubMenuID
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update category", "category_id", id, "error", err)
		return model.Category{}, err
	}

	s.slog.Info("category updated", "category_id", updated.ID)

	return updated, nil
}

func (s *categoryService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete category", "category_id", id, "error", err)
		return err
	}

	s.slog.Info("category deleted", "category_id", id)

	return nil
}
