package model

import "time"

type SubMenu struct {
	ID          string    `db:"id" json:"id"`
	HotelID     string    `db:"hotel_id" json:"hotelId"`
	Name        string    `db:"name" json:"name"`
	Description *string   `db:"description" json:"description,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}
