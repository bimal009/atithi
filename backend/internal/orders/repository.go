package orders

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderRepo interface {
	Create(ctx context.Context, order *model.Order, userID string) (model.Order, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Order, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Order, int, error)
	Update(ctx context.Context, order *model.Order, userID string) (model.Order, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Order, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type orderRepo struct {
	DB *pgxpool.Pool
}

func NewOrderRepo(db *pgxpool.Pool) OrderRepo {
	return &orderRepo{DB: db}
}

func (r *orderRepo) Create(ctx context.Context, order *model.Order, userID string) (model.Order, error) {
	query := `
		INSERT INTO orders (id, hotel_id, table_id, customer_id, status, total_amount, notes)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $8::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, table_id, customer_id, status, total_amount, notes, created_at, updated_at
	`

	var created model.Order

	err := r.DB.QueryRow(
		ctx, query,
		order.ID,
		order.HotelID,
		order.TableID,
		order.CustomerID,
		order.Status,
		order.TotalAmount,
		order.Notes,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.TableID,
		&created.CustomerID,
		&created.Status,
		&created.TotalAmount,
		&created.Notes,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return model.Order{}, apperr.ErrOrderResourceInvalid
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrHotelNotFound
		}
		return model.Order{}, err
	}

	return created, nil
}

func (r *orderRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Order, error) {
	query := `
		SELECT id, hotel_id, table_id, customer_id, status, total_amount, notes, created_at, updated_at
		FROM orders
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = orders.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var order model.Order

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&order.ID,
		&order.HotelID,
		&order.TableID,
		&order.CustomerID,
		&order.Status,
		&order.TotalAmount,
		&order.Notes,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrOrderNotFound
		}
		return model.Order{}, err
	}

	return order, nil
}

func (r *orderRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Order, int, error) {
	query := `
		SELECT id, hotel_id, table_id, customer_id, status, total_amount, notes, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM orders
		WHERE hotel_id = $1::uuid
		  AND ($5 = '' OR status = $5)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = orders.hotel_id AND m.user_id = $2::uuid AND m.status = 'active'
		  )
		ORDER BY created_at DESC
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
		if err := rows.Scan(
			&order.ID,
			&order.HotelID,
			&order.TableID,
			&order.CustomerID,
			&order.Status,
			&order.TotalAmount,
			&order.Notes,
			&order.CreatedAt,
			&order.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, order)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *orderRepo) Update(ctx context.Context, order *model.Order, userID string) (model.Order, error) {
	query := `
		UPDATE orders
		SET
			table_id = $1::uuid,
			customer_id = $2::uuid,
			total_amount = $3,
			notes = $4,
			updated_at = now()
		WHERE id = $5::uuid AND hotel_id = $6::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = orders.hotel_id AND m.user_id = $7::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, table_id, customer_id, status, total_amount, notes, created_at, updated_at
	`

	var updated model.Order

	err := r.DB.QueryRow(
		ctx, query,
		order.TableID,
		order.CustomerID,
		order.TotalAmount,
		order.Notes,
		order.ID,
		order.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.TableID,
		&updated.CustomerID,
		&updated.Status,
		&updated.TotalAmount,
		&updated.Notes,
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

	return updated, nil
}

func (r *orderRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Order, error) {
	query := `
		UPDATE orders
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = orders.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, table_id, customer_id, status, total_amount, notes, created_at, updated_at
	`

	var updated model.Order

	err := r.DB.QueryRow(ctx, query, status, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.TableID,
		&updated.CustomerID,
		&updated.Status,
		&updated.TotalAmount,
		&updated.Notes,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Order{}, apperr.ErrOrderNotFound
		}
		return model.Order{}, err
	}

	return updated, nil
}

func (r *orderRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM orders
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = orders.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
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
