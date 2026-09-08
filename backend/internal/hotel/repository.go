package hotel

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelRepo interface {
	Create(ctx context.Context, tx pgx.Tx, hotel *model.Hotel) (model.Hotel, error)
	Get(ctx context.Context, id, userID string) (model.Hotel, error)
	FindByID(ctx context.Context, id string) (model.Hotel, error)
	ListForUser(ctx context.Context, userID string) ([]model.Hotel, error)
	Update(ctx context.Context, hotel *model.Hotel, userID string) (model.Hotel, error)
	Delete(ctx context.Context, id, userID string) error
}

type hotelRepo struct {
	DB *pgxpool.Pool
}

func NewHotelRepo(db *pgxpool.Pool) HotelRepo {
	return &hotelRepo{
		DB: db,
	}
}


func (r *hotelRepo) Create(ctx context.Context, tx pgx.Tx, hotel *model.Hotel) (model.Hotel, error) {
	query := `
		INSERT INTO hotels (id, name, description, address, city, phone_number, email, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, name, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
	`

	var created model.Hotel

	err := tx.QueryRow(
		ctx, query,
		hotel.ID,
		hotel.Name,
		hotel.Description,
		hotel.Address,
		hotel.City,
		hotel.PhoneNumber,
		hotel.Email,
		hotel.CreatedBy,
	).Scan(
		&created.ID,
		&created.Name,
		&created.Description,
		&created.Address,
		&created.City,
		&created.PhoneNumber,
		&created.Email,
		&created.IsActive,
		&created.CreatedBy,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		return model.Hotel{}, err
	}

	return created, nil
}

func (r *hotelRepo) Get(ctx context.Context, id, userID string) (model.Hotel, error) {
	query := `
		SELECT id, name, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
		FROM hotels
		WHERE id = $1::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotels.id AND m.user_id = $2::uuid AND m.status = 'active'
		  )
	`

	var hotel model.Hotel

	err := r.DB.QueryRow(ctx, query, id, userID).Scan(
		&hotel.ID,
		&hotel.Name,
		&hotel.Description,
		&hotel.Address,
		&hotel.City,
		&hotel.PhoneNumber,
		&hotel.Email,
		&hotel.IsActive,
		&hotel.CreatedBy,
		&hotel.CreatedAt,
		&hotel.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Hotel{}, apperr.ErrHotelNotFound
		}
		return model.Hotel{}, err
	}

	return hotel, nil
}

func (r *hotelRepo) FindByID(ctx context.Context, id string) (model.Hotel, error) {
	query := `
		SELECT id, name, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
		FROM hotels
		WHERE id = $1::uuid
	`

	var hotel model.Hotel

	err := r.DB.QueryRow(ctx, query, id).Scan(
		&hotel.ID,
		&hotel.Name,
		&hotel.Description,
		&hotel.Address,
		&hotel.City,
		&hotel.PhoneNumber,
		&hotel.Email,
		&hotel.IsActive,
		&hotel.CreatedBy,
		&hotel.CreatedAt,
		&hotel.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Hotel{}, apperr.ErrHotelNotFound
		}
		return model.Hotel{}, err
	}

	return hotel, nil
}

func (r *hotelRepo) ListForUser(ctx context.Context, userID string) ([]model.Hotel, error) {
	query := `
		SELECT id, name, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
		FROM hotels
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotels.id AND m.user_id = $1::uuid AND m.status = 'active'
		)
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	hotels := make([]model.Hotel, 0)

	for rows.Next() {
		var hotel model.Hotel
		if err := rows.Scan(
			&hotel.ID,
			&hotel.Name,
			&hotel.Description,
			&hotel.Address,
			&hotel.City,
			&hotel.PhoneNumber,
			&hotel.Email,
			&hotel.IsActive,
			&hotel.CreatedBy,
			&hotel.CreatedAt,
			&hotel.UpdatedAt,
		); err != nil {
			return nil, err
		}
		hotels = append(hotels, hotel)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return hotels, nil
}

func (r *hotelRepo) Update(ctx context.Context, hotel *model.Hotel, userID string) (model.Hotel, error) {
	query := `
		UPDATE hotels
		SET
			name = $1,
			description = $2,
			address = $3,
			city = $4,
			phone_number = $5,
			email = $6,
			is_active = $7,
			updated_at = now()
		WHERE id = $8::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotels.id AND m.user_id = $9::uuid AND m.status = 'active'
		  )
		RETURNING id, name, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
	`

	var updated model.Hotel

	err := r.DB.QueryRow(
		ctx, query,
		hotel.Name,
		hotel.Description,
		hotel.Address,
		hotel.City,
		hotel.PhoneNumber,
		hotel.Email,
		hotel.IsActive,
		hotel.ID,
		userID,
	).Scan(
		&updated.ID,
		&updated.Name,
		&updated.Description,
		&updated.Address,
		&updated.City,
		&updated.PhoneNumber,
		&updated.Email,
		&updated.IsActive,
		&updated.CreatedBy,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Hotel{}, apperr.ErrHotelNotFound
		}
		return model.Hotel{}, err
	}

	return updated, nil
}

func (r *hotelRepo) Delete(ctx context.Context, id, userID string) error {
	query := `
		DELETE FROM hotels
		WHERE id = $1::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotels.id AND m.user_id = $2::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrHotelNotFound
	}

	return nil
}
