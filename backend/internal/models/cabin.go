package model

import "time"

type Cabin struct {
	ID            string    `db:"id" json:"id"`
	HotelID       string    `db:"hotel_id" json:"hotelId"`
	Name          string    `db:"name" json:"name"`
	Number        string    `db:"number" json:"number"`
	BasePrice     float64   `db:"base_price" json:"basePrice"`
	BillingTypeID *string   `db:"billing_type_id" json:"billingTypeId,omitempty"`
	Capacity      int       `db:"capacity" json:"capacity"`
	Description   *string   `db:"description" json:"description,omitempty"`
	Amenities     []string  `db:"amenities" json:"amenities"`
	Restrictions  []string  `db:"restrictions" json:"restrictions"`
	Status        string    `db:"status" json:"status"`
	Images        []string  `db:"images" json:"images"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt     time.Time `db:"updated_at" json:"updatedAt"`
}
