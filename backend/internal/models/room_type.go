package model

import "time"

type RoomType struct {
	ID            string    `db:"id" json:"id"`
	HotelID       string    `db:"hotel_id" json:"hotelId"`
	Name          string    `db:"name" json:"name"`
	BasePrice     float64   `db:"base_price" json:"basePrice"`
	BillingTypeID string    `db:"billing_type_id" json:"billingTypeId"`
	PricingLabel  *string   `db:"pricing_label" json:"pricingLabel,omitempty"`
	Capacity      int       `db:"capacity" json:"capacity"`
	Description   *string   `db:"description" json:"description,omitempty"`
	Amenities     []string  `db:"amenities" json:"amenities"`
	Restrictions  []string  `db:"restrictions" json:"restrictions"`
	Images        []string  `db:"-" json:"images"`
	IsTopPick     bool      `db:"is_top_pick" json:"isTopPick"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt     time.Time `db:"updated_at" json:"updatedAt"`
}
