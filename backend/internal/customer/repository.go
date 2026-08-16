package customer

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CustomerRepo interface {
	Create(ctx context.Context, customer *model.Customer) (model.Customer, error)
	Get(ctx context.Context, id, hotelID string) (model.Customer, error)
	ListForHotel(ctx context.Context, hotelID string, pagination model.Pagination) ([]model.Customer, int, error)
	Update(ctx context.Context, customer *model.Customer) (model.Customer, error)
	Delete(ctx context.Context, id, hotelID string) error
}

type customerRepo struct {
	DB *pgxpool.Pool
}

func NewCustomerRepo(db *pgxpool.Pool) CustomerRepo {
	return &customerRepo{
		DB: db,
	}
}

func (r *customerRepo) Create(ctx context.Context, customer *model.Customer) (model.Customer, error) {
	query := `
		INSERT INTO customers (hotel_id, name, phone, email, notes, document_type, document_number)
		VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)
		RETURNING id, hotel_id, name, phone, email, notes, document_type, document_number, created_at, updated_at
	`

	var created model.Customer

	err := r.DB.QueryRow(
		ctx, query,
		customer.HotelID,
		customer.Name,
		customer.Phone,
		customer.Email,
		customer.Notes,
		customer.DocumentType,
		customer.DocumentNumber,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.Phone,
		&created.Email,
		&created.Notes,
		&created.DocumentType,
		&created.DocumentNumber,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Customer{}, apperr.ErrCustomerPhoneExists
		}
		return model.Customer{}, err
	}

	return created, nil
}

func (r *customerRepo) Get(ctx context.Context, id, hotelID string) (model.Customer, error) {
	query := `
		SELECT id, hotel_id, name, phone, email, notes, document_type, document_number, created_at, updated_at
		FROM customers
		WHERE id = $1::uuid AND hotel_id = $2::uuid
	`

	var customer model.Customer

	err := r.DB.QueryRow(ctx, query, id, hotelID).Scan(
		&customer.ID,
		&customer.HotelID,
		&customer.Name,
		&customer.Phone,
		&customer.Email,
		&customer.Notes,
		&customer.DocumentType,
		&customer.DocumentNumber,
		&customer.CreatedAt,
		&customer.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Customer{}, apperr.ErrCustomerNotFound
		}
		return model.Customer{}, err
	}

	return customer, nil
}

func (r *customerRepo) ListForHotel(ctx context.Context, hotelID string, pagination model.Pagination) ([]model.Customer, int, error) {
	query := `
		SELECT id, hotel_id, name, phone, email, notes, document_type, document_number, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM customers
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR phone ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%' OR document_number ILIKE '%' || $2 || '%')
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	customers := make([]model.Customer, 0)
	var total int

	for rows.Next() {
		var c model.Customer
		if err := rows.Scan(
			&c.ID,
			&c.HotelID,
			&c.Name,
			&c.Phone,
			&c.Email,
			&c.Notes,
			&c.DocumentType,
			&c.DocumentNumber,
			&c.CreatedAt,
			&c.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		customers = append(customers, c)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return customers, total, nil
}

func (r *customerRepo) Update(ctx context.Context, customer *model.Customer) (model.Customer, error) {
	query := `
		UPDATE customers
		SET name = $1, phone = $2, email = $3, notes = $4, document_type = $5, document_number = $6, updated_at = now()
		WHERE id = $7::uuid AND hotel_id = $8::uuid
		RETURNING id, hotel_id, name, phone, email, notes, document_type, document_number, created_at, updated_at
	`

	var updated model.Customer

	err := r.DB.QueryRow(
		ctx, query,
		customer.Name,
		customer.Phone,
		customer.Email,
		customer.Notes,
		customer.DocumentType,
		customer.DocumentNumber,
		customer.ID,
		customer.HotelID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.Phone,
		&updated.Email,
		&updated.Notes,
		&updated.DocumentType,
		&updated.DocumentNumber,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Customer{}, apperr.ErrCustomerNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Customer{}, apperr.ErrCustomerPhoneExists
		}
		return model.Customer{}, err
	}

	return updated, nil
}

func (r *customerRepo) Delete(ctx context.Context, id, hotelID string) error {
	result, err := r.DB.Exec(ctx, `DELETE FROM customers WHERE id = $1::uuid AND hotel_id = $2::uuid`, id, hotelID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrCustomerNotFound
	}

	return nil
}
