package model

import "time"

type ReservationResourceRef struct {
	ID   string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type Reservation struct {
	ID             string                   `db:"id" json:"id"`
	HotelID        string                   `db:"hotel_id" json:"hotelId"`
	GuestName      string                   `db:"guest_name" json:"guestName"`
	GuestPhone     string                   `db:"guest_phone" json:"guestPhone"`
	PartySize      int                      `db:"party_size" json:"partySize"`
	ReservedAt     time.Time                `db:"reserved_at" json:"reservedAt"`
	ReservedBy     string                   `db:"reserved_by" json:"reservedBy"`
	ReservedByName string                   `db:"reserved_by_name" json:"reservedByName"`
	Status         string                   `db:"status" json:"status"`
	Notes          *string                  `db:"notes" json:"notes,omitempty"`
	Tables         []ReservationResourceRef `json:"tables"`
	Cabins         []ReservationResourceRef `json:"cabins"`
	CreatedAt      time.Time                `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time                `db:"updated_at" json:"updatedAt"`
}
