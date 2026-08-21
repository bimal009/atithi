package orders

import (
	"context"
	"encoding/json"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderRepo interface {
	Create(ctx context.Context, order *model.Order, items []OrderItemInput, userID string) (model.Order, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Order, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Order, int, error)
	Update(ctx context.Context, order *model.Order, items *[]OrderItemInput, userID string) (model.Order, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Order, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type orderRepo struct {
	DB *pgxpool.Pool
}

func NewOrderRepo(db *pgxpool.Pool) OrderRepo {
	return &orderRepo{DB: db}
}

func (r *orderRepo) Create(ctx context.Context, order *model.Order, items []OrderItemInput, userID string) (model.Order, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.Order{}, err
	}
	defer tx.Rollback(ctx)

	var orderID string
	err = tx.QueryRow(ctx, `
		INSERT INTO orders (id, hotel_id, table_id, room_id, cabin_id, customer_id, status, notes, created_by)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, $7, $8, m.id
		FROM members m
		WHERE m.hotel_id = $2::uuid AND m.user_id = $9::uuid AND m.status = 'active'
		RETURNING id
	`,
		order.ID,
		order.HotelID,
		order.TableID,
		order.RoomID,
		order.CabinID,
		order.CustomerID,
		order.Status,
		order.Notes,
		userID,
	).Scan(&orderID)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrHotelNotFound
		}
		if apperr.IsForeignKeyViolation(err) {
			return model.Order{}, apperr.ErrOrderResourceInvalid
		}
		return model.Order{}, err
	}

	if err := insertOrderItems(ctx, tx, orderID, order.HotelID, items); err != nil {
		return model.Order{}, err
	}
	if err := recomputeTotal(ctx, tx, orderID); err != nil {
		return model.Order{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return model.Order{}, err
	}

	return r.Get(ctx, orderID, order.HotelID, userID)
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
		  AND EXISTS (
			SELECT 1 FROM members mm WHERE mm.hotel_id = o.hotel_id AND mm.user_id = $2::uuid AND mm.status = 'active'
		  )
		ORDER BY o.created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.DB.Query(ctx, query, hotelID, userID, pagination.Limit, pagination.Offset(), status)
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

	var orderID string
	err = tx.QueryRow(ctx, `
		UPDATE orders
		SET table_id = $1::uuid, room_id = $2::uuid, cabin_id = $3::uuid, customer_id = $4::uuid, notes = $5, updated_at = now()
		WHERE id = $6::uuid AND hotel_id = $7::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = orders.hotel_id AND m.user_id = $8::uuid AND m.status = 'active'
		  )
		RETURNING id
	`,
		order.TableID,
		order.RoomID,
		order.CabinID,
		order.CustomerID,
		order.Notes,
		order.ID,
		order.HotelID,
		userID,
	).Scan(&orderID)

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
		if _, err := tx.Exec(ctx, `DELETE FROM order_items WHERE order_id = $1::uuid`, orderID); err != nil {
			return model.Order{}, err
		}
		if err := insertOrderItems(ctx, tx, orderID, order.HotelID, *items); err != nil {
			return model.Order{}, err
		}
		if err := recomputeTotal(ctx, tx, orderID); err != nil {
			return model.Order{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return model.Order{}, err
	}

	return r.Get(ctx, orderID, order.HotelID, userID)
}

func (r *orderRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Order, error) {
	result, err := r.DB.Exec(ctx, `
		UPDATE orders
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = orders.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
	`, status, id, hotelID, userID)
	if err != nil {
		return model.Order{}, err
	}
	if result.RowsAffected() == 0 {
		return model.Order{}, apperr.ErrOrderNotFound
	}

	return r.Get(ctx, id, hotelID, userID)
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
