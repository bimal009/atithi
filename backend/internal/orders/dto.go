package orders

import model "github.com/bimal009/atithi/internal/models"

const (
	StatusPending   = "pending"
	StatusPreparing = "preparing"
	StatusReady     = "ready"
	StatusServed    = "served"
	StatusCancelled = "cancelled"
)

type CreateOrderRequest struct {
	TableID    *string          `json:"tableId,omitempty" validate:"omitempty,uuid"`
	RoomID     *string          `json:"roomId,omitempty" validate:"omitempty,uuid"`
	CabinID    *string          `json:"cabinId,omitempty" validate:"omitempty,uuid"`
	CustomerID *string          `json:"customerId,omitempty" validate:"omitempty,uuid"`
	Items      []OrderItemInput `json:"items" validate:"required,min=1,dive"`
	Notes      *string          `json:"notes,omitempty" validate:"omitempty,max=1000"`
}

type UpdateOrderRequest struct {
	TableID    *string           `json:"tableId,omitempty" validate:"omitempty,uuid"`
	RoomID     *string           `json:"roomId,omitempty" validate:"omitempty,uuid"`
	CabinID    *string           `json:"cabinId,omitempty" validate:"omitempty,uuid"`
	CustomerID *string           `json:"customerId,omitempty" validate:"omitempty,uuid"`
	Items      *[]OrderItemInput `json:"items,omitempty" validate:"omitempty,min=1,dive"`
	Notes      *string           `json:"notes,omitempty" validate:"omitempty,max=1000"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=pending preparing ready served cancelled"`
}

type ListOrdersResponse struct {
	Orders []model.Order `json:"orders"`
	Page   int           `json:"page"`
	Limit  int           `json:"limit"`
	Total  int           `json:"total"`
}

type ListOrdersQuery struct {
	model.Pagination
	Status string `form:"status" json:"status" validate:"omitempty,oneof=pending preparing ready served cancelled"`
}
