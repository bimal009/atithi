package rooms

import model "github.com/bimal009/atithi/internal/models"

const (
	StatusAvailable   = "available"
	StatusOccupied    = "occupied"
	StatusCleaning    = "cleaning"
	StatusMaintenance = "maintenance"
)

type CreateRoomRequest struct {
	RoomTypeID string   `json:"roomTypeId" validate:"required,uuid"`
	Number     string   `json:"number" validate:"required,min=1,max=20"`
	Floor      int      `json:"floor" validate:"gte=0"`
	Images     []string `json:"images,omitempty" validate:"omitempty,max=10,dive,url"`
}

type UpdateRoomRequest struct {
	RoomTypeID *string  `json:"roomTypeId,omitempty" validate:"omitempty,uuid"`
	Number     *string  `json:"number,omitempty" validate:"omitempty,min=1,max=20"`
	Floor      *int     `json:"floor,omitempty" validate:"omitempty,gte=0"`
	Images     []string `json:"images,omitempty" validate:"omitempty,max=10,dive,url"`
}

type UpdateRoomStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=available occupied cleaning maintenance"`
}

type ListRoomsResponse struct {
	Rooms []model.Room `json:"rooms"`
	Page  int          `json:"page"`
	Limit int          `json:"limit"`
	Total int          `json:"total"`
}

type ListRoomsQuery struct {
	model.Pagination
	Status string `form:"status" json:"status" validate:"omitempty,oneof=available occupied cleaning maintenance"`
}
