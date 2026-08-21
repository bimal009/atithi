package model

import "time"

type Order struct {
	ID                   string         `db:"id" json:"id"`
	HotelID              string         `db:"hotel_id" json:"hotelId"`
	TableID              *string        `db:"table_id" json:"tableId,omitempty"`
	TableName            *string        `json:"tableName,omitempty"`
	RoomID               *string        `db:"room_id" json:"roomId,omitempty"`
	RoomNumber           *string        `json:"roomNumber,omitempty"`
	CabinID              *string        `db:"cabin_id" json:"cabinId,omitempty"`
	CabinName            *string        `json:"cabinName,omitempty"`
	CustomerID           *string        `db:"customer_id" json:"customerId,omitempty"`
	CustomerName         *string        `json:"customerName,omitempty"`
	Status               string         `db:"status" json:"status"`
	TotalAmount          float64        `db:"total_amount" json:"totalAmount"`
	TaxPercent           float64        `json:"taxPercent"`
	TaxAmount            float64        `json:"taxAmount"`
	ServiceChargePercent float64        `json:"serviceChargePercent"`
	ServiceChargeAmount  float64        `json:"serviceChargeAmount"`
	GrandTotal           float64        `json:"grandTotal"`
	Notes                *string        `db:"notes" json:"notes,omitempty"`
	CreatedBy            string         `db:"created_by" json:"createdBy"`
	CreatedByName        string         `db:"created_by_name" json:"createdByName"`
	CreatedByImage       *string        `json:"createdByImage,omitempty"`
	Items                []OrderItemRef `json:"items"`
	CreatedAt            time.Time      `db:"created_at" json:"createdAt"`
	UpdatedAt            time.Time      `db:"updated_at" json:"updatedAt"`
}
