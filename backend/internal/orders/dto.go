package orders

import model "github.com/bimal009/atithi/internal/models"

const (
	StatusPending   = "pending"
	StatusPreparing = "preparing"
	StatusCompleted = "completed"
	StatusCancelled = "cancelled"
)

type CreateOrderRequest struct {
	TableID     *string `json:"tableId,omitempty" validate:"omitempty,uuid"`
	CustomerID  *string `json:"customerId,omitempty" validate:"omitempty,uuid"`
	TotalAmount float64 `json:"totalAmount" validate:"gte=0"`
	Notes       *string `json:"notes,omitempty" validate:"omitempty,max=1000"`
}

type UpdateOrderRequest struct {
	TableID     *string  `json:"tableId,omitempty" validate:"omitempty,uuid"`
	CustomerID  *string  `json:"customerId,omitempty" validate:"omitempty,uuid"`
	TotalAmount *float64 `json:"totalAmount,omitempty" validate:"omitempty,gte=0"`
	Notes       *string  `json:"notes,omitempty" validate:"omitempty,max=1000"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=pending preparing completed cancelled"`
}

type ListOrdersResponse struct {
	Orders []model.Order `json:"orders"`
	Page   int           `json:"page"`
	Limit  int           `json:"limit"`
	Total  int           `json:"total"`
}

type ListOrdersQuery struct {
	model.Pagination
	Status string `form:"status" json:"status" validate:"omitempty,oneof=pending preparing completed cancelled"`
}
