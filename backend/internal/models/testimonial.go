package model

import "time"

type Testimonial struct {
	ID        string    `db:"id" json:"id"`
	HotelID   string    `db:"hotel_id" json:"hotelId"`
	GuestName string    `db:"guest_name" json:"guestName"`
	StayLabel *string   `db:"stay_label" json:"stayLabel,omitempty"`
	Quote     string    `db:"quote" json:"quote"`
	Rating    *int      `db:"rating" json:"rating,omitempty"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}
