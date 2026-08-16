package roomtypes

type CreateRoomTypeRequest struct {
	Name        string   `json:"name" validate:"required,min=2,max=255"`
	BasePrice   float64  `json:"basePrice" validate:"required,gte=0"`
	Capacity    int      `json:"capacity" validate:"required,gt=0"`
	Description *string  `json:"description,omitempty" validate:"omitempty,max=2000"`
	Amenities   []string `json:"amenities,omitempty"`
}

type UpdateRoomTypeRequest struct {
	Name        *string  `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	BasePrice   *float64 `json:"basePrice,omitempty" validate:"omitempty,gte=0"`
	Capacity    *int     `json:"capacity,omitempty" validate:"omitempty,gt=0"`
	Description *string  `json:"description,omitempty" validate:"omitempty,max=2000"`
	Amenities   []string `json:"amenities,omitempty"`
}
