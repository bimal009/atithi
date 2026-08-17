package model

import "time"

type Room struct {
	ID         string    `db:"id" json:"id"`
	HotelID    string    `db:"hotel_id" json:"hotelId"`
	RoomTypeID string    `db:"room_type_id" json:"roomTypeId"`
	Number     string    `db:"number" json:"number"`
	Floor      int       `db:"floor" json:"floor"`
	Status     string    `db:"status" json:"status"`
	Images     []string  `db:"images" json:"images"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt  time.Time `db:"updated_at" json:"updatedAt"`
}
