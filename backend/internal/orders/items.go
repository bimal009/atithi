package orders

import (
	"context"
	"encoding/json"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
)

type OrderItemInput struct {
	MenuItemID string   `json:"menuItemId" validate:"required,uuid"`
	Quantity   int      `json:"quantity" validate:"required,gt=0"`
	AddOnIDs   []string `json:"addOnIds,omitempty" validate:"omitempty,dive,uuid"`
}

const orderColumns = `
	o.id, o.hotel_id, o.table_id, dt.name, o.room_id, rm.number, o.cabin_id, cb.name, o.customer_id, c.name,
	o.status, o.total_amount, o.notes,
	o.created_by, u.name, o.created_at, o.updated_at,
	COALESCE((
		SELECT json_agg(json_build_object(
			'menuItemId', oi.menu_item_id,
			'name', d.name,
			'price', mi.price,
			'quantity', oi.quantity,
			'addOns', COALESCE((
				SELECT json_agg(json_build_object('id', a.id, 'name', ad.name, 'price', a.price))
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

func insertOrderItems(ctx context.Context, tx pgx.Tx, orderID, hotelID string, items []OrderItemInput) error {
	menuItemIDs := make([]string, len(items))
	quantities := make([]int, len(items))
	for i, it := range items {
		menuItemIDs[i] = it.MenuItemID
		quantities[i] = it.Quantity
	}

	tag, err := tx.Exec(ctx, `
		INSERT INTO order_items (order_id, menu_item_id, quantity)
		SELECT $1::uuid, x.menu_item_id, x.quantity
		FROM unnest($2::uuid[], $3::int[]) AS x(menu_item_id, quantity)
		JOIN menu_items mi ON mi.id = x.menu_item_id AND mi.hotel_id = $4::uuid
	`, orderID, menuItemIDs, quantities, hotelID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != int64(len(items)) {
		return apperr.ErrOrderResourceInvalid
	}

	var addOnMenuItemIDs, addOnIDs []string
	for _, it := range items {
		for _, addOnID := range it.AddOnIDs {
			addOnMenuItemIDs = append(addOnMenuItemIDs, it.MenuItemID)
			addOnIDs = append(addOnIDs, addOnID)
		}
	}

	if len(addOnIDs) == 0 {
		return nil
	}

	tag, err = tx.Exec(ctx, `
		INSERT INTO order_item_add_ons (order_id, menu_item_id, add_on_id)
		SELECT $1::uuid, x.menu_item_id, x.add_on_id
		FROM unnest($2::uuid[], $3::uuid[]) AS x(menu_item_id, add_on_id)
		JOIN add_ons a ON a.id = x.add_on_id AND a.hotel_id = $4::uuid
	`, orderID, addOnMenuItemIDs, addOnIDs, hotelID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != int64(len(addOnIDs)) {
		return apperr.ErrOrderResourceInvalid
	}

	return nil
}

func recomputeTotal(ctx context.Context, tx pgx.Tx, orderID string) error {
	_, err := tx.Exec(ctx, `
		UPDATE orders SET total_amount = COALESCE((
			SELECT SUM(
				(mi.price + COALESCE((
					SELECT SUM(a.price) FROM order_item_add_ons oia
					JOIN add_ons a ON a.id = oia.add_on_id
					WHERE oia.order_id = oi.order_id AND oia.menu_item_id = oi.menu_item_id
				), 0)) * oi.quantity
			)
			FROM order_items oi
			JOIN menu_items mi ON mi.id = oi.menu_item_id
			WHERE oi.order_id = orders.id
		), 0)
		WHERE id = $1::uuid
	`, orderID)
	return err
}
