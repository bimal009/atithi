package model

import "time"

type Cabin struct {
	ID           string    `db:"id" json:"id"`
	HotelID      string    `db:"hotel_id" json:"hotelId"`
	Name         string    `db:"name" json:"name"`
	Number       string    `db:"number" json:"number"`
	BasePrice    float64   `db:"base_price" json:"basePrice"`
	PricingUnit  string    `db:"pricing_unit" json:"pricingUnit"`
	PricingLabel *string   `db:"pricing_label" json:"pricingLabel,omitempty"`
	Capacity     int       `db:"capacity" json:"capacity"`
	Description  *string   `db:"description" json:"description,omitempty"`
	Amenities    []string  `db:"amenities" json:"amenities"`
	Restrictions []string  `db:"restrictions" json:"restrictions"`
	Status       string    `db:"status" json:"status"`
	Images       []string  `db:"images" json:"images"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}
