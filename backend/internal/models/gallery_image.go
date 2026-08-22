package model

import "time"

type GalleryImage struct {
	ID        string    `db:"id" json:"id"`
	HotelID   string    `db:"hotel_id" json:"hotelId"`
	URL       string    `db:"url" json:"url"`
	Section   string    `db:"section" json:"section"`
	Position  int       `db:"position" json:"position"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}
