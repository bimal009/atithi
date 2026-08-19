package addons

import model "github.com/bimal009/atithi/internal/models"

type CreateAddOnRequest struct {
	Name      string  `json:"name" validate:"required,min=2,max=150"`
	ImageURL  *string `json:"imageUrl,omitempty" validate:"omitempty,url"`
	Price     float64 `json:"price" validate:"gte=0"`
	Available *bool   `json:"available,omitempty"`
}

type UpdateAddOnRequest struct {
	Price     *float64 `json:"price,omitempty" validate:"omitempty,gte=0"`
	Available *bool    `json:"available,omitempty"`
}

type ListAddOnsResponse struct {
	AddOns []model.AddOn `json:"addOns"`
	Page   int           `json:"page"`
	Limit  int           `json:"limit"`
	Total  int           `json:"total"`
}
