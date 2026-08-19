package model

import "time"

type SubMenuRef struct {
	ID   string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type Category struct {
	ID        string       `db:"id" json:"id"`
	HotelID   string       `db:"hotel_id" json:"hotelId"`
	Name      string       `db:"name" json:"name"`
	SubMenus  []SubMenuRef `json:"subMenus"`
	CreatedAt time.Time    `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time    `db:"updated_at" json:"updatedAt"`
}
