package orders

import (
	"encoding/json"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/jackc/pgx/v5"
)

type OrderItemAddOnInput struct {
	AddOnID  string `json:"addOnId" validate:"required,uuid"`
	Quantity int    `json:"quantity" validate:"required,gt=0"`
}

type OrderItemInput struct {
	MenuItemID string                `json:"menuItemId" validate:"required,uuid"`
	Quantity   int                   `json:"quantity" validate:"required,gt=0"`
	AddOns     []OrderItemAddOnInput `json:"addOns,omitempty" validate:"omitempty,dive"`
}

const orderColumns = `
	o.id, o.hotel_id, o.table_id, dt.name, o.room_id, rm.number, o.cabin_id, cb.name, o.customer_id, c.name,
	o.status, o.total_amount, o.notes,
	o.created_by, u.name, u.image, o.created_at, o.updated_at,
	COALESCE((
		SELECT json_agg(json_build_object(
			'menuItemId', oi.menu_item_id,
			'name', d.name,
			'price', mi.price,
			'quantity', oi.quantity,
			'addOns', COALESCE((
				SELECT json_agg(json_build_object('id', a.id, 'name', ad.name, 'price', a.price, 'quantity', oia.quantity))
				FROM order_item_add_ons oia
				JOIN add_ons a ON a.id = oia.add_on_id
				JOIN dishes ad ON ad.id = a.dish_id
				WHERE oia.order_id = oi.order_id AND oia.menu_item_id = oi.menu_item_id
			), '[]')
		))
		FROM order_items oi
		JOIN menu_items mi ON mi.id = oi.menu_item_id
		JOIN dishes d ON d.id = mi.dish_id
		WHERE oi.order_id = o.id
	), '[]') AS items
`

const orderFrom = `
	FROM orders o
	JOIN members m ON m.id = o.created_by
	JOIN users u ON u.id = m.user_id
	LEFT JOIN dining_tables dt ON dt.id = o.table_id
	LEFT JOIN rooms rm ON rm.id = o.room_id
	LEFT JOIN cabins cb ON cb.id = o.cabin_id
	LEFT JOIN customers c ON c.id = o.customer_id
`

func scanOrder(row pgx.Row) (model.Order, error) {
	var order model.Order
	var itemsJSON []byte

	if err := row.Scan(
		&order.ID,
		&order.HotelID,
		&order.TableID,
		&order.TableName,
		&order.RoomID,
		&order.RoomNumber,
		&order.CabinID,
		&order.CabinName,
		&order.CustomerID,
		&order.CustomerName,
		&order.Status,
		&order.TotalAmount,
		&order.Notes,
		&order.CreatedBy,
		&order.CreatedByName,
		&order.CreatedByImage,
		&order.CreatedAt,
		&order.UpdatedAt,
		&itemsJSON,
	); err != nil {
		return model.Order{}, err
	}

	if err := json.Unmarshal(itemsJSON, &order.Items); err != nil {
		return model.Order{}, err
	}
	if order.Items == nil {
		order.Items = []model.OrderItemRef{}
	}

	return order, nil
}

