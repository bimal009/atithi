package orderitems

import (
	"context"

	"github.com/jackc/pgx/v5"
)

type ItemAddOn struct {
	AddOnID  string
	Quantity int
}

type Item struct {
	MenuItemID string
	Quantity   int
	AddOns     []ItemAddOn
}

type OrderItemRepo interface {
	InsertTx(ctx context.Context, tx pgx.Tx, orderID, hotelID string, items []Item) error
	DeleteAllTx(ctx context.Context, tx pgx.Tx, orderID string) error
}

type orderItemRepo struct{}

func NewOrderItemRepo() OrderItemRepo {
	return &orderItemRepo{}
}

func (r *orderItemRepo) InsertTx(ctx context.Context, tx pgx.Tx, orderID, hotelID string, items []Item) error {
	menuItemIDs := make([]string, len(items))
	quantities := make([]int, len(items))
	for i, it := range items {
		menuItemIDs[i] = it.MenuItemID
		quantities[i] = it.Quantity
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO order_items (order_id, menu_item_id, quantity)
		SELECT $1::uuid, x.menu_item_id, x.quantity
		FROM unnest($2::uuid[], $3::int[]) AS x(menu_item_id, quantity)
		JOIN menu_items mi ON mi.id = x.menu_item_id AND mi.hotel_id = $4::uuid
	`, orderID, menuItemIDs, quantities, hotelID); err != nil {
		return err
	}

	var addOnMenuItemIDs []string
	var addOnIDs []string
	var addOnQuantities []int
	for _, it := range items {
		for _, ao := range it.AddOns {
			addOnMenuItemIDs = append(addOnMenuItemIDs, it.MenuItemID)
			addOnIDs = append(addOnIDs, ao.AddOnID)
			addOnQuantities = append(addOnQuantities, ao.Quantity)
		}
	}
	if len(addOnIDs) == 0 {
		return nil
	}

	_, err := tx.Exec(ctx, `
		INSERT INTO order_item_add_ons (order_id, menu_item_id, add_on_id, quantity)
		SELECT $1::uuid, x.menu_item_id, x.add_on_id, x.quantity
		FROM unnest($2::uuid[], $3::uuid[], $4::int[]) AS x(menu_item_id, add_on_id, quantity)
		JOIN add_ons a ON a.id = x.add_on_id AND a.hotel_id = $5::uuid
	`, orderID, addOnMenuItemIDs, addOnIDs, addOnQuantities, hotelID)

	return err
}

func (r *orderItemRepo) DeleteAllTx(ctx context.Context, tx pgx.Tx, orderID string) error {
	_, err := tx.Exec(ctx, `DELETE FROM order_items WHERE order_id = $1::uuid`, orderID)
	return err
}
