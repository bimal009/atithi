package orders

import (
	"context"
	"encoding/json"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/orderitems"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// MenuItemPricer is the narrow slice of menuitems this package needs to
// price a ticket inside its own transaction.
type MenuItemPricer interface {
	GetPricesTx(ctx context.Context, tx pgx.Tx, ids []string, hotelID string) (map[string]float64, error)
}

// AddOnPricer is the narrow slice of addons this package needs to price a
// ticket inside its own transaction.
type AddOnPricer interface {
	GetPricesTx(ctx context.Context, tx pgx.Tx, ids []string, hotelID string) (map[string]float64, error)
}

type OrderRepo interface {
	Create(ctx context.Context, order *model.Order, items []OrderItemInput, userID string) (model.Order, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Order, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Order, int, error)
	Update(ctx context.Context, order *model.Order, items *[]OrderItemInput, userID string) (model.Order, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Order, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type orderRepo struct {
	DB        *pgxpool.Pool
	menuItems MenuItemPricer
	addOns    AddOnPricer
	items     orderitems.OrderItemRepo
}

func NewOrderRepo(db *pgxpool.Pool, menuItems MenuItemPricer, addOns AddOnPricer, items orderitems.OrderItemRepo) OrderRepo {
	return &orderRepo{DB: db, menuItems: menuItems, addOns: addOns, items: items}
}

func toOrderItems(items []OrderItemInput) []orderitems.Item {
	out := make([]orderitems.Item, len(items))
	for i, it := range items {
		addOns := make([]orderitems.ItemAddOn, len(it.AddOns))
		for j, ao := range it.AddOns {
			addOns[j] = orderitems.ItemAddOn{AddOnID: ao.AddOnID, Quantity: ao.Quantity}
		}
		out[i] = orderitems.Item{MenuItemID: it.MenuItemID, Quantity: it.Quantity, AddOns: addOns}
	}
	return out
}

func (r *orderRepo) priceItems(ctx context.Context, tx pgx.Tx, hotelID string, items []OrderItemInput) (float64, error) {
	menuItemIDs := make([]string, len(items))
	for i, it := range items {
		menuItemIDs[i] = it.MenuItemID
	}
	var addOnIDs []string
	for _, it := range items {
		for _, ao := range it.AddOns {
			addOnIDs = append(addOnIDs, ao.AddOnID)
		}
	}

	itemPrices, err := r.menuItems.GetPricesTx(ctx, tx, menuItemIDs, hotelID)
	if err != nil {
		return 0, err
	}
	addOnPrices, err := r.addOns.GetPricesTx(ctx, tx, addOnIDs, hotelID)
	if err != nil {
		return 0, err
	}

	var total float64
	for _, it := range items {
		price, ok := itemPrices[it.MenuItemID]
		if !ok {
			return 0, apperr.ErrOrderResourceInvalid
		}
		lineTotal := price * float64(it.Quantity)
		for _, ao := range it.AddOns {
			addOnPrice, ok := addOnPrices[ao.AddOnID]
			if !ok {
				return 0, apperr.ErrOrderResourceInvalid
			}
			lineTotal += addOnPrice * float64(ao.Quantity)
		}
		total += lineTotal
	}

	return total, nil
}

func (r *orderRepo) Create(ctx context.Context, order *model.Order, items []OrderItemInput, userID string) (model.Order, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.Order{}, err
	}
	defer tx.Rollback(ctx)

	total, err := r.priceItems(ctx, tx, order.HotelID, items)
	if err != nil {
		return model.Order{}, err
	}

	var created model.Order
	err = tx.QueryRow(ctx, `
		INSERT INTO orders (id, hotel_id, table_id, room_id, cabin_id, customer_id, status, notes, created_by, total_amount)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, $7, $8, m.id, $9
		FROM members m
		WHERE m.hotel_id = $2::uuid AND m.user_id = $10::uuid AND m.status = 'active'
		RETURNING id, hotel_id, table_id, room_id, cabin_id, customer_id, status, total_amount, notes, created_by, created_at, updated_at
	`,
		order.ID,
		order.HotelID,
		order.TableID,
		order.RoomID,
		order.CabinID,
		order.CustomerID,
		order.Status,
		order.Notes,
		total,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.TableID,
		&created.RoomID,
		&created.CabinID,
		&created.CustomerID,
		&created.Status,
		&created.TotalAmount,
		&created.Notes,
		&created.CreatedBy,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrHotelNotFound
		}
		if apperr.IsForeignKeyViolation(err) {
			return model.Order{}, apperr.ErrOrderResourceInvalid
		}
		return model.Order{}, err
	}

	if err := r.items.InsertTx(ctx, tx, created.ID, order.HotelID, toOrderItems(items)); err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return model.Order{}, apperr.ErrOrderResourceInvalid
		}
		return model.Order{}, err
	}
	created.Items = []model.OrderItemRef{}

	if err := tx.Commit(ctx); err != nil {
		return model.Order{}, err
	}

	return created, nil
}

func (r *orderRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Order, error) {
	query := "SELECT " + orderColumns + orderFrom + `
		WHERE o.id = $1::uuid AND o.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members mm WHERE mm.hotel_id = o.hotel_id AND mm.user_id = $3::uuid AND mm.status = 'active'
		  )
	`

	order, err := scanOrder(r.DB.QueryRow(ctx, query, id, hotelID, userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrOrderNotFound
		}
		return model.Order{}, err
	}

	return order, nil
}

func (r *orderRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Order, int, error) {
	query := "SELECT " + orderColumns + `, COUNT(*) OVER() AS total` + orderFrom + `
		WHERE o.hotel_id = $1::uuid
		  AND ($5 = '' OR o.status = $5)
		  AND (
		    $6 = ''
		    OR dt.name ILIKE '%' || $6 || '%'
		    OR rm.number ILIKE '%' || $6 || '%'
		    OR cb.name ILIKE '%' || $6 || '%'
		    OR c.name ILIKE '%' || $6 || '%'
		    OR u.name ILIKE '%' || $6 || '%'
		    OR o.id::text ILIKE $6 || '%'
		  )
		  AND EXISTS (
			SELECT 1 FROM members mm WHERE mm.hotel_id = o.hotel_id AND mm.user_id = $2::uuid AND mm.status = 'active'
		  )
		ORDER BY o.created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.DB.Query(ctx, query, hotelID, userID, pagination.Limit, pagination.Offset(), status, pagination.Search)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Order, 0)
	var total int

	for rows.Next() {
		var order model.Order
		var itemsJSON []byte
		if err := rows.Scan(
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
			&total,
		); err != nil {
			return nil, 0, err
		}
		if err := json.Unmarshal(itemsJSON, &order.Items); err != nil {
			return nil, 0, err
		}
		if order.Items == nil {
			order.Items = []model.OrderItemRef{}
		}
		list = append(list, order)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *orderRepo) Update(ctx context.Context, order *model.Order, items *[]OrderItemInput, userID string) (model.Order, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.Order{}, err
	}
	defer tx.Rollback(ctx)

	var newTotal *float64
	if items != nil {
		total, err := r.priceItems(ctx, tx, order.HotelID, *items)
		if err != nil {
			return model.Order{}, err
		}
		newTotal = &total
	}

	var updated model.Order
	err = tx.QueryRow(ctx, `
		UPDATE orders
		SET table_id = $1::uuid, room_id = $2::uuid, cabin_id = $3::uuid, customer_id = $4::uuid, notes = $5,
		    total_amount = COALESCE($6, total_amount), updated_at = now()
		WHERE id = $7::uuid AND hotel_id = $8::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = orders.hotel_id AND m.user_id = $9::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, table_id, room_id, cabin_id, customer_id, status, total_amount, notes, created_by, created_at, updated_at
	`,
		order.TableID,
		order.RoomID,
		order.CabinID,
		order.CustomerID,
		order.Notes,
		newTotal,
		order.ID,
		order.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.TableID,
		&updated.RoomID,
		&updated.CabinID,
		&updated.CustomerID,
		&updated.Status,
		&updated.TotalAmount,
		&updated.Notes,
		&updated.CreatedBy,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrOrderNotFound
		}
		if apperr.IsForeignKeyViolation(err) {
			return model.Order{}, apperr.ErrOrderResourceInvalid
		}
		return model.Order{}, err
	}

	if items != nil {
		if err := r.items.DeleteAllTx(ctx, tx, updated.ID); err != nil {
			return model.Order{}, err
		}

		if err := r.items.InsertTx(ctx, tx, updated.ID, order.HotelID, toOrderItems(*items)); err != nil {
			if apperr.IsForeignKeyViolation(err) {
				return model.Order{}, apperr.ErrOrderResourceInvalid
			}
			return model.Order{}, err
		}
	}
	updated.Items = []model.OrderItemRef{}

	if err := tx.Commit(ctx); err != nil {
		return model.Order{}, err
	}

	return updated, nil
}

func (r *orderRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Order, error) {
	var updated model.Order
	err := r.DB.QueryRow(ctx, `
		UPDATE orders
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = orders.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, table_id, room_id, cabin_id, customer_id, status, total_amount, notes, created_by, created_at, updated_at
	`, status, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.TableID,
		&updated.RoomID,
		&updated.CabinID,
		&updated.CustomerID,
		&updated.Status,
		&updated.TotalAmount,
		&updated.Notes,
		&updated.CreatedBy,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrOrderNotFound
		}
		return model.Order{}, err
	}
	updated.Items = []model.OrderItemRef{}

	return updated, nil
}

func (r *orderRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM orders
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = orders.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrOrderNotFound
	}

	return nil
}
