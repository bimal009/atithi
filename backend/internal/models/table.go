package model

import "time"

type Table struct {
	ID        string    `db:"id" json:"id"`
	HotelID   string    `db:"hotel_id" json:"hotelId"`
	Name      string    `db:"name" json:"name"`
	Capacity  int       `db:"capacity" json:"capacity"`
	SectionID string    `db:"section_id" json:"sectionId"`
	Status    string    `db:"status" json:"status"`
	Images    []string  `db:"images" json:"images"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}
