package model

import "time"

type Order struct {
	ID          string    `db:"id" json:"id"`
	HotelID     string    `db:"hotel_id" json:"hotelId"`
	TableID     *string   `db:"table_id" json:"tableId,omitempty"`
	CustomerID  *string   `db:"customer_id" json:"customerId,omitempty"`
	Status      string    `db:"status" json:"status"`
	TotalAmount float64   `db:"total_amount" json:"totalAmount"`
	Notes       *string   `db:"notes" json:"notes,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}
