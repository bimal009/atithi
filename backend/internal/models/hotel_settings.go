package model

import "time"

type HotelSettings struct {
	HotelID              string    `db:"hotel_id" json:"hotelId"`
	Currency             string    `db:"currency" json:"currency"`
	TaxPercent           float64   `db:"tax_percent" json:"taxPercent"`
	ServiceChargePercent float64   `db:"service_charge_percent" json:"serviceChargePercent"`
	MapURL               *string   `db:"map_url" json:"mapUrl,omitempty"`
	CreatedAt            time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt            time.Time `db:"updated_at" json:"updatedAt"`
}
