package hotel

type CreateHotelRequest struct {
	Name        string  `json:"name" validate:"required,min=2,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=2000"`
	Address     string  `json:"address" validate:"required,min=5,max=500"`
	City        *string `json:"city,omitempty" validate:"omitempty,max=100"`
	PhoneNumber string  `json:"phoneNumber" validate:"required,nepaliphone"`
	Email       *string `json:"email,omitempty" validate:"omitempty,email"`
}

type UpdateHotelRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=2000"`
	Address     *string `json:"address,omitempty" validate:"omitempty,min=5,max=500"`
	City        *string `json:"city,omitempty" validate:"omitempty,max=100"`
	PhoneNumber *string `json:"phoneNumber,omitempty" validate:"omitempty,nepaliphone"`
	Email       *string `json:"email,omitempty" validate:"omitempty,email"`
	IsActive    *bool   `json:"isActive,omitempty"`
}
