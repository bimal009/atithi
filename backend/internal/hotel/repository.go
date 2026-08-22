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
	GetBySlug(ctx context.Context, slug, userID string) (model.Hotel, error)
	SlugExists(ctx context.Context, slug string) (bool, error)
	FindBySlug(ctx context.Context, slug string) (model.Hotel, error)
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

func (r *hotelRepo) logoForHotel(ctx context.Context, hotelID string) (*string, error) {
	var url string
	err := r.DB.QueryRow(ctx, `
		SELECT url FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = 'logo'
		ORDER BY created_at DESC
		LIMIT 1
	`, hotelID).Scan(&url)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &url, nil
}

func (r *hotelRepo) logosForHotels(ctx context.Context, hotelIDs []string) (map[string]string, error) {
	if len(hotelIDs) == 0 {
		return map[string]string{}, nil
	}

	rows, err := r.DB.Query(ctx, `
		SELECT hotel_id, url FROM hotel_images
		WHERE hotel_id = ANY($1::uuid[]) AND entity_type = 'logo'
		ORDER BY created_at DESC
	`, hotelIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byHotel := map[string]string{}
	for rows.Next() {
		var hotelID, url string
		if err := rows.Scan(&hotelID, &url); err != nil {
			return nil, err
		}
		if _, ok := byHotel[hotelID]; !ok {
			byHotel[hotelID] = url
		}
	}
	return byHotel, rows.Err()
}

func (r *hotelRepo) Create(ctx context.Context, tx pgx.Tx, hotel *model.Hotel) (model.Hotel, error) {
	query := `
		INSERT INTO hotels (id, name, slug, description, address, city, phone_number, email, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, name, slug, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
	`

	var created model.Hotel

	err := tx.QueryRow(
		ctx, query,
		hotel.ID,
		hotel.Name,
		hotel.Slug,
		hotel.Description,
		hotel.Address,
		hotel.City,
		hotel.PhoneNumber,
		hotel.Email,
		hotel.CreatedBy,
	).Scan(
		&created.ID,
		&created.Name,
		&created.Slug,
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
		if apperr.IsUniqueViolation(err) {
			return model.Hotel{}, apperr.ErrHotelSlugExists
		}
		return model.Hotel{}, err
	}

	return created, nil
}

func (r *hotelRepo) Get(ctx context.Context, id, userID string) (model.Hotel, error) {
	query := `
		SELECT id, name, slug, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
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
		&hotel.Slug,
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

	logo, err := r.logoForHotel(ctx, hotel.ID)
	if err != nil {
		return model.Hotel{}, err
	}
	hotel.LogoURL = logo

	return hotel, nil
}

func (r *hotelRepo) GetBySlug(ctx context.Context, slug, userID string) (model.Hotel, error) {
	query := `
		SELECT id, name, slug, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
		FROM hotels
		WHERE slug = $1
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotels.id AND m.user_id = $2::uuid AND m.status = 'active'
		  )
	`

	var hotel model.Hotel

	err := r.DB.QueryRow(ctx, query, slug, userID).Scan(
		&hotel.ID,
		&hotel.Name,
		&hotel.Slug,
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

	logo, err := r.logoForHotel(ctx, hotel.ID)
	if err != nil {
		return model.Hotel{}, err
	}
	hotel.LogoURL = logo

	return hotel, nil
}

func (r *hotelRepo) FindBySlug(ctx context.Context, slug string) (model.Hotel, error) {
	query := `
		SELECT id, name, slug, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
		FROM hotels
		WHERE slug = $1
	`

	var hotel model.Hotel

	err := r.DB.QueryRow(ctx, query, slug).Scan(
		&hotel.ID,
		&hotel.Name,
		&hotel.Slug,
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

	logo, err := r.logoForHotel(ctx, hotel.ID)
	if err != nil {
		return model.Hotel{}, err
	}
	hotel.LogoURL = logo

	return hotel, nil
}

func (r *hotelRepo) SlugExists(ctx context.Context, slug string) (bool, error) {
	var exists bool

	err := r.DB.QueryRow(
		ctx,
		`SELECT EXISTS (SELECT 1 FROM hotels WHERE slug = $1)`,
		slug,
	).Scan(&exists)

	return exists, err
}

func (r *hotelRepo) ListForUser(ctx context.Context, userID string) ([]model.Hotel, error) {
	query := `
		SELECT id, name, slug, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
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
			&hotel.Slug,
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

	ids := make([]string, len(hotels))
	for i, h := range hotels {
		ids[i] = h.ID
	}
	logos, err := r.logosForHotels(ctx, ids)
	if err != nil {
		return nil, err
	}
	for i := range hotels {
		if url, ok := logos[hotels[i].ID]; ok {
			hotels[i].LogoURL = &url
		}
	}

	return hotels, nil
}

func (r *hotelRepo) Update(ctx context.Context, hotel *model.Hotel, userID string) (model.Hotel, error) {
	query := `
		UPDATE hotels
		SET
			name = $1,
			slug = $2,
			description = $3,
			address = $4,
			city = $5,
			phone_number = $6,
			email = $7,
			is_active = $8,
			updated_at = now()
		WHERE id = $9::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotels.id AND m.user_id = $10::uuid AND m.status = 'active'
		  )
		RETURNING id, name, slug, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
	`

	var updated model.Hotel

	err := r.DB.QueryRow(
		ctx, query,
		hotel.Name,
		hotel.Slug,
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
		&updated.Slug,
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
		if apperr.IsUniqueViolation(err) {
			return model.Hotel{}, apperr.ErrHotelSlugExists
		}
		return model.Hotel{}, err
	}

	logo, err := r.logoForHotel(ctx, updated.ID)
	if err != nil {
		return model.Hotel{}, err
	}
	updated.LogoURL = logo

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
