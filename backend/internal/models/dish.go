package model

import "time"

type Dish struct {
	ID        string    `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	ImageURL  *string   `db:"image_url" json:"imageUrl,omitempty"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}

type AddOnRef struct {
	ID    string  `db:"id" json:"id"`
	Name  string  `db:"name" json:"name"`
	Price float64 `db:"price" json:"price"`
}

type MenuItem struct {
	ID           string     `db:"id" json:"id"`
	HotelID      string     `db:"hotel_id" json:"hotelId"`
	DishID       string     `db:"dish_id" json:"dishId"`
	Name         string     `db:"name" json:"name"`
	ImageURL     *string    `db:"image_url" json:"imageUrl,omitempty"`
	CategoryID   string     `db:"category_id" json:"categoryId"`
	CategoryName string     `db:"category_name" json:"categoryName"`
	FoodType     string     `db:"food_type" json:"foodType"`
	Price        float64    `db:"price" json:"price"`
	Discount     *float64   `db:"discount" json:"discount,omitempty"`
	Description  *string    `db:"description" json:"description,omitempty"`
	Ingredients  *string    `db:"ingredients" json:"ingredients,omitempty"`
	Available    bool       `db:"available" json:"available"`
	IsTopPick    bool       `db:"is_top_pick" json:"isTopPick"`
	AddOns       []AddOnRef `json:"addOns"`
	CreatedAt    time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updatedAt"`
}
