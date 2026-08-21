package model

import "time"

type Notification struct {
	ID        string    `db:"id" json:"id"`
	HotelID   string    `db:"hotel_id" json:"hotelId"`
	Type      string    `db:"type" json:"type"`
	Title     string    `db:"title" json:"title"`
	Subtitle  *string   `db:"subtitle" json:"subtitle,omitempty"`
	Read      bool      `db:"read" json:"read"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}
