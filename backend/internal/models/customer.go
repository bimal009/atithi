package model

import "time"

type Customer struct {
	ID             string    `db:"id" json:"id"`
	HotelID        string    `db:"hotel_id" json:"hotelId"`
	Name           string    `db:"name" json:"name"`
	Phone          string    `db:"phone" json:"phone"`
	Email          *string   `db:"email" json:"email,omitempty"`
	Notes          *string   `db:"notes" json:"notes,omitempty"`
	DocumentType   *string   `db:"document_type" json:"documentType,omitempty"`
	DocumentNumber *string   `db:"document_number" json:"documentNumber,omitempty"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
}
