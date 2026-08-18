package menuitems

import model "github.com/bimal009/atithi/internal/models"

type CreateMenuItemRequest struct {
	Name        string   `json:"name" validate:"required,min=2,max=150"`
	ImageURL    *string  `json:"imageUrl,omitempty" validate:"omitempty,url"`
	Category    string   `json:"category" validate:"required,min=1,max=100"`
	FoodType    string   `json:"foodType" validate:"required,oneof=veg non-veg vegan egg"`
	Price       float64  `json:"price" validate:"gte=0"`
	Discount    *float64 `json:"discount,omitempty" validate:"omitempty,gte=0"`
	Description *string  `json:"description,omitempty" validate:"omitempty,max=1000"`
	Ingredients *string  `json:"ingredients,omitempty" validate:"omitempty,max=1000"`
	Available   *bool    `json:"available,omitempty"`
}

type UpdateMenuItemRequest struct {
	Category    *string  `json:"category,omitempty" validate:"omitempty,min=1,max=100"`
	FoodType    *string  `json:"foodType,omitempty" validate:"omitempty,oneof=veg non-veg vegan egg"`
	Price       *float64 `json:"price,omitempty" validate:"omitempty,gte=0"`
	Discount    *float64 `json:"discount,omitempty" validate:"omitempty,gte=0"`
	Description *string  `json:"description,omitempty" validate:"omitempty,max=1000"`
	Ingredients *string  `json:"ingredients,omitempty" validate:"omitempty,max=1000"`
	Available   *bool    `json:"available,omitempty"`
}

type ListMenuItemsResponse struct {
	MenuItems []model.MenuItem `json:"menuItems"`
	Page      int              `json:"page"`
	Limit     int              `json:"limit"`
	Total     int              `json:"total"`
}

type ListMenuItemsQuery struct {
	model.Pagination
	Category string `form:"category" json:"category" validate:"omitempty,max=100"`
	FoodType string `form:"foodType" json:"foodType" validate:"omitempty,oneof=veg non-veg vegan egg"`
}
