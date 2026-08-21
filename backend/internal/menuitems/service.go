package menuitems

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type MenuItemService interface {
	SearchDishes(ctx context.Context, search string) ([]model.Dish, error)
	Create(ctx context.Context, hotelID, userID string, req *CreateMenuItemRequest) (model.MenuItem, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.MenuItem, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListMenuItemsQuery) (ListMenuItemsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateMenuItemRequest) (model.MenuItem, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type menuItemService struct {
	slog     *slog.Logger
	repo     MenuItemRepo
	notifier notifications.Notifier
}

func NewMenuItemService(slog *slog.Logger, repo MenuItemRepo, notifier notifications.Notifier) MenuItemService {
	return &menuItemService{slog: slog, repo: repo, notifier: notifier}
}

func (s *menuItemService) SearchDishes(ctx context.Context, search string) ([]model.Dish, error) {
	search = strings.TrimSpace(search)
	if search == "" {
		return []model.Dish{}, nil
	}

	return s.repo.SearchDishes(ctx, search, 10)
}

func (s *menuItemService) Create(ctx context.Context, hotelID, userID string, req *CreateMenuItemRequest) (model.MenuItem, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.MenuItem{}, err
	}

	available := true
	if req.Available != nil {
		available = *req.Available
	}

	newItem := &model.MenuItem{
		ID:          uuid.NewString(),
		HotelID:     hotelID,
		CategoryID:  req.CategoryID,
		FoodType:    req.FoodType,
		Price:       req.Price,
		Discount:    req.Discount,
		Description: req.Description,
		Ingredients: req.Ingredients,
		Available:   available,
	}

	created, err := s.repo.CreateWithDish(ctx, req.Name, req.ImageURL, newItem, req.AddOnIDs, userID)
	if err != nil {
		s.slog.Error("failed to create menu item", "hotel_id", hotelID, "error", err)
		return model.MenuItem{}, err
	}

	s.slog.Info("menu item created", "menu_item_id", created.ID, "hotel_id", hotelID, "dish_id", created.DishID)

	s.notifier.Notify(ctx, hotelID, model.NotifMenuItemCreated, fmt.Sprintf("Menu item '%s' added", created.Name), nil)

	return created, nil
}

func (s *menuItemService) Get(ctx context.Context, id, hotelID, userID string) (model.MenuItem, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *menuItemService) GetAll(ctx context.Context, hotelID, userID string, query ListMenuItemsQuery) (ListMenuItemsResponse, error) {
	if err := validator.ValidateStruct(&query); err != nil {
		return ListMenuItemsResponse{}, err
	}
	if err := query.Pagination.Validate(); err != nil {
		return ListMenuItemsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.CategoryID, query.FoodType, query.Pagination)
	if err != nil {
		return ListMenuItemsResponse{}, err
	}

	return ListMenuItemsResponse{
		MenuItems: list,
		Page:      query.Pagination.Page,
		Limit:     query.Pagination.Limit,
		Total:     total,
	}, nil
}

func (s *menuItemService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateMenuItemRequest) (model.MenuItem, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.MenuItem{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.MenuItem{}, err
	}

	if req.CategoryID != nil {
		existing.CategoryID = *req.CategoryID
	}
	if req.FoodType != nil {
		existing.FoodType = *req.FoodType
	}
	if req.Price != nil {
		existing.Price = *req.Price
	}
	if req.Discount != nil {
		existing.Discount = req.Discount
	}
	if req.Description != nil {
		existing.Description = req.Description
	}
	if req.Ingredients != nil {
		existing.Ingredients = req.Ingredients
	}
	if req.Available != nil {
		existing.Available = *req.Available
	}

	updated, err := s.repo.Update(ctx, &existing, req.AddOnIDs, userID)
	if err != nil {
		s.slog.Error("failed to update menu item", "menu_item_id", id, "error", err)
		return model.MenuItem{}, err
	}

	s.slog.Info("menu item updated", "menu_item_id", updated.ID)

	s.notifier.Notify(ctx, hotelID, model.NotifMenuItemUpdated, fmt.Sprintf("Menu item '%s' updated", updated.Name), nil)

	return updated, nil
}

func (s *menuItemService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete menu item", "menu_item_id", id, "error", err)
		return err
	}

	s.slog.Info("menu item deleted", "menu_item_id", id)

	s.notifier.Notify(ctx, hotelID, model.NotifMenuItemDeleted, "Menu item removed", nil)

	return nil
}
