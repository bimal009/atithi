package cabins

import model "github.com/bimal009/atithi/internal/models"

const (
	StatusAvailable   = "available"
	StatusOccupied    = "occupied"
	StatusCleaning    = "cleaning"
	StatusMaintenance = "maintenance"
)

type CreateCabinRequest struct {
	Name          string   `json:"name" validate:"required,min=2,max=255"`
	Number        string   `json:"number" validate:"required,min=1,max=20"`
	BasePrice     float64  `json:"basePrice" validate:"gte=0"`
	BillingTypeID string   `json:"billingTypeId" validate:"required,uuid"`
	Capacity      int      `json:"capacity" validate:"required,gt=0"`
	Description   *string  `json:"description,omitempty" validate:"omitempty,max=2000"`
	Amenities     []string `json:"amenities,omitempty"`
	Restrictions  []string `json:"restrictions,omitempty"`
}

type UpdateCabinRequest struct {
	Name          *string  `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	Number        *string  `json:"number,omitempty" validate:"omitempty,min=1,max=20"`
	BasePrice     *float64 `json:"basePrice,omitempty" validate:"omitempty,gte=0"`
	BillingTypeID *string  `json:"billingTypeId,omitempty" validate:"omitempty,uuid"`
	Capacity      *int     `json:"capacity,omitempty" validate:"omitempty,gt=0"`
	Description   *string  `json:"description,omitempty" validate:"omitempty,max=2000"`
	Amenities     []string `json:"amenities,omitempty"`
	Restrictions  []string `json:"restrictions,omitempty"`
}

type UpdateCabinStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=available occupied cleaning maintenance"`
}

type ListCabinsResponse struct {
	Cabins []model.Cabin `json:"cabins"`
	Page   int           `json:"page"`
	Limit  int           `json:"limit"`
	Total  int           `json:"total"`
}

type ListCabinsQuery struct {
	model.Pagination
	Status string `form:"status" json:"status" validate:"omitempty,oneof=available occupied cleaning maintenance"`
}
