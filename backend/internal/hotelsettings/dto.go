package hotelsettings

type UpdateHotelSettingsRequest struct {
	Currency             *string  `json:"currency,omitempty" validate:"omitempty,len=3"`
	TaxPercent           *float64 `json:"taxPercent,omitempty" validate:"omitempty,gte=0,lte=100"`
	ServiceChargePercent *float64 `json:"serviceChargePercent,omitempty" validate:"omitempty,gte=0,lte=100"`
	MapURL               *string  `json:"mapUrl,omitempty" validate:"omitempty,url,max=2048"`
	AboutUs              *string  `json:"aboutUs,omitempty" validate:"omitempty,max=5000"`
	Amenities            []string `json:"amenities,omitempty"`
}
