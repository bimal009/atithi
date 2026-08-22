package cabins

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CabinRepo interface {
	Create(ctx context.Context, cabin *model.Cabin, userID string) (model.Cabin, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Cabin, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Cabin, int, error)
	Update(ctx context.Context, cabin *model.Cabin, userID string) (model.Cabin, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Cabin, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type cabinRepo struct {
	DB *pgxpool.Pool
}

func NewCabinRepo(db *pgxpool.Pool) CabinRepo {
	return &cabinRepo{DB: db}
}

// imagesForCabin loads a single cabin's photos from the shared hotel_images table.
func (r *cabinRepo) imagesForCabin(ctx context.Context, cabinID string) ([]string, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT url FROM hotel_images
		WHERE entity_type = 'cabin' AND entity_id = $1::uuid
		ORDER BY position, created_at
	`, cabinID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	images := []string{}
	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			return nil, err
		}
		images = append(images, url)
	}
	return images, rows.Err()
}

// imagesForCabins loads photos for many cabins in one query, grouped by cabin id.
func (r *cabinRepo) imagesForCabins(ctx context.Context, hotelID string) (map[string][]string, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT entity_id, url FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = 'cabin'
		ORDER BY position, created_at
	`, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byCabin := map[string][]string{}
	for rows.Next() {
		var cabinID *string
		var url string
		if err := rows.Scan(&cabinID, &url); err != nil {
			return nil, err
		}
		if cabinID == nil {
			continue
		}
		byCabin[*cabinID] = append(byCabin[*cabinID], url)
	}
	return byCabin, rows.Err()
}

func (r *cabinRepo) Create(ctx context.Context, cabin *model.Cabin, userID string) (model.Cabin, error) {
	query := `
		INSERT INTO cabins (id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status)
		SELECT $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $12::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status, created_at, updated_at
	`

	var created model.Cabin

	err := r.DB.QueryRow(
		ctx, query,
		cabin.ID,
		cabin.HotelID,
		cabin.Name,
		cabin.Number,
		cabin.BasePrice,
		cabin.BillingTypeID,
		cabin.Capacity,
		cabin.Description,
		cabin.Amenities,
		cabin.Restrictions,
		cabin.Status,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.Number,
		&created.BasePrice,
		&created.BillingTypeID,
		&created.Capacity,
		&created.Description,
		&created.Amenities,
		&created.Restrictions,
		&created.Status,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Cabin{}, apperr.ErrCabinNumberExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Cabin{}, apperr.ErrHotelNotFound
		}
		return model.Cabin{}, err
	}

	created.Images = []string{}
	return created, nil
}

func (r *cabinRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Cabin, error) {
	query := `
		SELECT id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status, created_at, updated_at
		FROM cabins
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = cabins.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var cabin model.Cabin

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&cabin.ID,
		&cabin.HotelID,
		&cabin.Name,
		&cabin.Number,
		&cabin.BasePrice,
		&cabin.BillingTypeID,
		&cabin.Capacity,
		&cabin.Description,
		&cabin.Amenities,
		&cabin.Restrictions,
		&cabin.Status,
		&cabin.CreatedAt,
		&cabin.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Cabin{}, apperr.ErrCabinNotFound
		}
		return model.Cabin{}, err
	}

	images, err := r.imagesForCabin(ctx, cabin.ID)
	if err != nil {
		return model.Cabin{}, err
	}
	cabin.Images = images

	return cabin, nil
}

func (r *cabinRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Cabin, int, error) {
	query := `
		SELECT id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM cabins
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR number ILIKE '%' || $2 || '%')
		  AND ($6 = '' OR status = $6)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = cabins.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY number
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset(), status)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Cabin, 0)
	var total int

	for rows.Next() {
		var cabin model.Cabin
		if err := rows.Scan(
			&cabin.ID,
			&cabin.HotelID,
			&cabin.Name,
			&cabin.Number,
			&cabin.BasePrice,
			&cabin.BillingTypeID,
			&cabin.Capacity,
			&cabin.Description,
			&cabin.Amenities,
			&cabin.Restrictions,
			&cabin.Status,
			&cabin.CreatedAt,
			&cabin.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, cabin)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	imagesByCabin, err := r.imagesForCabins(ctx, hotelID)
	if err != nil {
		return nil, 0, err
	}
	for i := range list {
		if imgs, ok := imagesByCabin[list[i].ID]; ok {
			list[i].Images = imgs
		} else {
			list[i].Images = []string{}
		}
	}

	return list, total, nil
}

func (r *cabinRepo) Update(ctx context.Context, cabin *model.Cabin, userID string) (model.Cabin, error) {
	query := `
		UPDATE cabins
		SET
			name = $1,
			number = $2,
			base_price = $3,
			billing_type_id = $4,
			capacity = $5,
			description = $6,
			amenities = $7,
			restrictions = $8,
			updated_at = now()
		WHERE id = $9::uuid AND hotel_id = $10::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = cabins.hotel_id AND m.user_id = $11::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status, created_at, updated_at
	`

	var updated model.Cabin

	err := r.DB.QueryRow(
		ctx, query,
		cabin.Name,
		cabin.Number,
		cabin.BasePrice,
		cabin.BillingTypeID,
		cabin.Capacity,
		cabin.Description,
		cabin.Amenities,
		cabin.Restrictions,
		cabin.ID,
		cabin.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.Number,
		&updated.BasePrice,
		&updated.BillingTypeID,
		&updated.Capacity,
		&updated.Description,
		&updated.Amenities,
		&updated.Restrictions,
		&updated.Status,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Cabin{}, apperr.ErrCabinNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Cabin{}, apperr.ErrCabinNumberExists
		}
		return model.Cabin{}, err
	}

	images, err := r.imagesForCabin(ctx, updated.ID)
	if err != nil {
		return model.Cabin{}, err
	}
	updated.Images = images

	return updated, nil
}

func (r *cabinRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Cabin, error) {
	query := `
		UPDATE cabins
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = cabins.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status, created_at, updated_at
	`

	var updated model.Cabin

	err := r.DB.QueryRow(ctx, query, status, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.Number,
		&updated.BasePrice,
		&updated.BillingTypeID,
		&updated.Capacity,
		&updated.Description,
		&updated.Amenities,
		&updated.Restrictions,
		&updated.Status,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Cabin{}, apperr.ErrCabinNotFound
		}
		return model.Cabin{}, err
	}

	images, err := r.imagesForCabin(ctx, updated.ID)
	if err != nil {
		return model.Cabin{}, err
	}
	updated.Images = images

	return updated, nil
}

func (r *cabinRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM cabins
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = cabins.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrCabinNotFound
	}

	if _, err := r.DB.Exec(ctx, `DELETE FROM hotel_images WHERE entity_type = 'cabin' AND entity_id = $1::uuid`, id); err != nil {
		return err
	}

	return nil
}
