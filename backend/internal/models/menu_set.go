package model

import "time"

type MenuSetItemRef struct {
	ID       string  `db:"id" json:"id"`
	Name     string  `db:"name" json:"name"`
	Price    float64 `db:"price" json:"price"`
	Quantity int     `db:"quantity" json:"quantity"`
}

type MenuSet struct {
	ID          string           `db:"id" json:"id"`
	HotelID     string           `db:"hotel_id" json:"hotelId"`
	Name        string           `db:"name" json:"name"`
	Description *string          `db:"description" json:"description,omitempty"`
	Price       float64          `db:"price" json:"price"`
	Available   bool             `db:"available" json:"available"`
	Items       []MenuSetItemRef `json:"items"`
	CreatedAt   time.Time        `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time        `db:"updated_at" json:"updatedAt"`
}
