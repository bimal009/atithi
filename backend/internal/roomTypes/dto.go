package roomtypes

type CreateRoomTypeRequest struct {
	Name          string   `json:"name" validate:"required,min=2,max=255"`
	BasePrice     float64  `json:"basePrice" validate:"gte=0"`
	BillingTypeID string   `json:"billingTypeId" validate:"required,uuid"`
	PricingLabel  *string  `json:"pricingLabel,omitempty" validate:"omitempty,max=255"`
	Capacity      int      `json:"capacity" validate:"required,gt=0"`
	Description   *string  `json:"description,omitempty" validate:"omitempty,max=2000"`
	Amenities     []string `json:"amenities,omitempty"`
	Restrictions  []string `json:"restrictions,omitempty"`
}

type UpdateRoomTypeRequest struct {
	Name          *string  `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	BasePrice     *float64 `json:"basePrice,omitempty" validate:"omitempty,gte=0"`
	BillingTypeID *string  `json:"billingTypeId,omitempty" validate:"omitempty,uuid"`
	PricingLabel  *string  `json:"pricingLabel,omitempty" validate:"omitempty,max=255"`
	Capacity      *int     `json:"capacity,omitempty" validate:"omitempty,gt=0"`
	Description   *string  `json:"description,omitempty" validate:"omitempty,max=2000"`
	Amenities     []string `json:"amenities,omitempty"`
	Restrictions  []string `json:"restrictions,omitempty"`
}
