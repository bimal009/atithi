package hotelsettings

type UpdateHotelSettingsRequest struct {
	Currency             *string  `json:"currency,omitempty" validate:"omitempty,len=3"`
	TaxPercent           *float64 `json:"taxPercent,omitempty" validate:"omitempty,gte=0,lte=100"`
	ServiceChargePercent *float64 `json:"serviceChargePercent,omitempty" validate:"omitempty,gte=0,lte=100"`
}
