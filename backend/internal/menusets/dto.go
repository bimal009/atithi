package menusets

import model "github.com/bimal009/atithi/internal/models"

type MenuSetItemInput struct {
	MenuItemID string `json:"menuItemId" validate:"required,uuid"`
	Quantity   int    `json:"quantity" validate:"required,gt=0"`
}

type CreateMenuSetRequest struct {
	Name        string             `json:"name" validate:"required,min=2,max=150"`
	Description *string            `json:"description,omitempty" validate:"omitempty,max=500"`
	Price       float64            `json:"price" validate:"gte=0"`
	Available   *bool              `json:"available,omitempty"`
	Items       []MenuSetItemInput `json:"items" validate:"required,min=1,dive"`
}

type UpdateMenuSetRequest struct {
	Name        *string            `json:"name,omitempty" validate:"omitempty,min=2,max=150"`
	Description *string            `json:"description,omitempty" validate:"omitempty,max=500"`
	Price       *float64           `json:"price,omitempty" validate:"omitempty,gte=0"`
	Available   *bool              `json:"available,omitempty"`
	Items       []MenuSetItemInput `json:"items" validate:"omitempty,min=1,dive"`
}

type ListMenuSetsResponse struct {
	MenuSets []model.MenuSet `json:"menuSets"`
	Page     int             `json:"page"`
	Limit    int             `json:"limit"`
	Total    int             `json:"total"`
}
