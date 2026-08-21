package model

type OrderItemAddOnRef struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

type OrderItemRef struct {
	MenuItemID string              `json:"menuItemId"`
	Name       string              `json:"name"`
	Price      float64             `json:"price"`
	Quantity   int                 `json:"quantity"`
	AddOns     []OrderItemAddOnRef `json:"addOns"`
}
