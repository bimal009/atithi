package tables

import model "github.com/bimal009/atithi/internal/models"

const (
	StatusAvailable   = "available"
	StatusOccupied    = "occupied"
	StatusCleaning    = "cleaning"
	StatusMaintenance = "maintenance"
)

type CreateTableRequest struct {
	Name     string   `json:"name" validate:"required,min=1,max=50"`
	Capacity int      `json:"capacity" validate:"required,gt=0"`
	Section  string   `json:"section" validate:"required,oneof=indoor outdoor rooftop"`
	Images   []string `json:"images,omitempty" validate:"omitempty,max=3,dive,url"`
}

type UpdateTableRequest struct {
	Name     *string  `json:"name,omitempty" validate:"omitempty,min=1,max=50"`
	Capacity *int     `json:"capacity,omitempty" validate:"omitempty,gt=0"`
	Section  *string  `json:"section,omitempty" validate:"omitempty,oneof=indoor outdoor rooftop"`
	Images   []string `json:"images,omitempty" validate:"omitempty,max=3,dive,url"`
}

type UpdateTableStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=available occupied cleaning maintenance"`
}

type ListTablesResponse struct {
	Tables []model.Table `json:"tables"`
	Page   int           `json:"page"`
	Limit  int           `json:"limit"`
	Total  int           `json:"total"`
}

type ListTablesQuery struct {
	model.Pagination
	Status string `form:"status" json:"status" validate:"omitempty,oneof=available occupied cleaning maintenance"`
}
