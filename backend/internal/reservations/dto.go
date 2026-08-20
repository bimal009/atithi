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
	TableIDs   []string  `json:"tableIds,omitempty" validate:"required_without=CabinIDs,omitempty,dive,uuid"`
	CabinIDs   []string  `json:"cabinIds,omitempty" validate:"required_without=TableIDs,omitempty,dive,uuid"`
	GuestName  string    `json:"guestName" validate:"required,min=2,max=255"`
	GuestPhone string    `json:"guestPhone" validate:"required,min=7,max=20"`
	PartySize  int       `json:"partySize" validate:"required,gt=0"`
	ReservedAt time.Time `json:"reservedAt" validate:"required"`
	Notes      *string   `json:"notes,omitempty" validate:"omitempty,max=1000"`
}

type UpdateReservationRequest struct {
	TableIDs   *[]string  `json:"tableIds,omitempty" validate:"omitempty,dive,uuid"`
	CabinIDs   *[]string  `json:"cabinIds,omitempty" validate:"omitempty,dive,uuid"`
	GuestName  *string    `json:"guestName,omitempty" validate:"omitempty,min=2,max=255"`
	GuestPhone *string    `json:"guestPhone,omitempty" validate:"omitempty,min=7,max=20"`
	PartySize  *int       `json:"partySize,omitempty" validate:"omitempty,gt=0"`
	ReservedAt *time.Time `json:"reservedAt,omitempty"`
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
