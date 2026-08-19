package model

import "time"

type Category struct {
	ID          string    `db:"id" json:"id"`
	HotelID     string    `db:"hotel_id" json:"hotelId"`
	Name        string    `db:"name" json:"name"`
	SubMenuID   *string   `db:"sub_menu_id" json:"subMenuId,omitempty"`
	SubMenuName *string   `db:"sub_menu_name" json:"subMenuName,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}
