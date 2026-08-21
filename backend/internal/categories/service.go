package categories

import (
	"context"
	"fmt"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type CategoryService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateCategoryRequest) (model.Category, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Category, error)
	GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListCategoriesResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateCategoryRequest) (model.Category, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type categoryService struct {
	slog     *slog.Logger
	repo     CategoryRepo
	notifier notifications.Notifier
}

func NewCategoryService(slog *slog.Logger, repo CategoryRepo, notifier notifications.Notifier) CategoryService {
	return &categoryService{slog: slog, repo: repo, notifier: notifier}
}

func (s *categoryService) Create(ctx context.Context, hotelID, userID string, req *CreateCategoryRequest) (model.Category, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Category{}, err
	}

	newCategory := &model.Category{
		ID:      uuid.NewString(),
		HotelID: hotelID,
		Name:    req.Name,
	}

	created, err := s.repo.Create(ctx, newCategory, req.SubMenuIDs, userID)
	if err != nil {
		s.slog.Error("failed to create category", "hotel_id", hotelID, "error", err)
		return model.Category{}, err
	}

	s.slog.Info("category created", "category_id", created.ID, "hotel_id", hotelID)

	s.notifier.Notify(ctx, hotelID, model.NotifCategoryCreated, fmt.Sprintf("Category '%s' added", created.Name), nil)

	return created, nil
}

func (s *categoryService) Get(ctx context.Context, id, hotelID, userID string) (model.Category, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *categoryService) GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListCategoriesResponse, error) {
	if err := pagination.Validate(); err != nil {
		return ListCategoriesResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, pagination)
	if err != nil {
		return ListCategoriesResponse{}, err
	}

	return ListCategoriesResponse{
		Categories: list,
		Page:       pagination.Page,
		Limit:      pagination.Limit,
		Total:      total,
	}, nil
}

func (s *categoryService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateCategoryRequest) (model.Category, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Category{}, err
	}

	updated, err := s.repo.Update(ctx, id, hotelID, userID, req.Name, req.SubMenuIDs)
	if err != nil {
		s.slog.Error("failed to update category", "category_id", id, "error", err)
		return model.Category{}, err
	}

	s.slog.Info("category updated", "category_id", updated.ID)

	s.notifier.Notify(ctx, hotelID, model.NotifCategoryUpdated, fmt.Sprintf("Category '%s' updated", updated.Name), nil)

	return updated, nil
}

func (s *categoryService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete category", "category_id", id, "error", err)
		return err
	}

	s.slog.Info("category deleted", "category_id", id)

	s.notifier.Notify(ctx, hotelID, model.NotifCategoryDeleted, "Category removed", nil)

	return nil
}
