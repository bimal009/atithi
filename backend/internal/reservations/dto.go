package reservations

import (
	"time"

	model "github.com/bimal009/atithi/internal/models"
)

const (
	StatusConfirmed = "confirmed"
	StatusSeated    = "seated"
	StatusCompleted = "completed"
	StatusCancelled = "cancelled"
	StatusNoShow    = "no_show"
)

type CreateReservationRequest struct {
	TableID    string    `json:"tableId" validate:"required,uuid"`
	GuestName  string    `json:"guestName" validate:"required,min=2,max=255"`
	GuestPhone string    `json:"guestPhone" validate:"required,min=7,max=20"`
	PartySize  int       `json:"partySize" validate:"required,gt=0"`
	ReservedAt time.Time `json:"reservedAt" validate:"required"`
	ReservedBy string    `json:"reservedBy" validate:"required,min=1,max=100"`
	Notes      *string   `json:"notes,omitempty" validate:"omitempty,max=1000"`
}

type UpdateReservationRequest struct {
	TableID    *string    `json:"tableId,omitempty" validate:"omitempty,uuid"`
	GuestName  *string    `json:"guestName,omitempty" validate:"omitempty,min=2,max=255"`
	GuestPhone *string    `json:"guestPhone,omitempty" validate:"omitempty,min=7,max=20"`
	PartySize  *int       `json:"partySize,omitempty" validate:"omitempty,gt=0"`
	ReservedAt *time.Time `json:"reservedAt,omitempty"`
	ReservedBy *string    `json:"reservedBy,omitempty" validate:"omitempty,min=1,max=100"`
	Notes      *string    `json:"notes,omitempty" validate:"omitempty,max=1000"`
}

type UpdateReservationStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=confirmed seated completed cancelled no_show"`
}

type ListReservationsResponse struct {
	Reservations []model.Reservation `json:"reservations"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
	Total        int                 `json:"total"`
}

type ListReservationsQuery struct {
	model.Pagination
	Status string `form:"status" json:"status" validate:"omitempty,oneof=confirmed seated completed cancelled no_show"`
}
