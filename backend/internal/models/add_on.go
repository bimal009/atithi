package model

import "time"

type AddOn struct {
	ID        string    `db:"id" json:"id"`
	HotelID   string    `db:"hotel_id" json:"hotelId"`
	DishID    string    `db:"dish_id" json:"dishId"`
	Name      string    `db:"name" json:"name"`
	ImageURL  *string   `db:"image_url" json:"imageUrl,omitempty"`
	Price     float64   `db:"price" json:"price"`
	Available bool      `db:"available" json:"available"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}
