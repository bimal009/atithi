package billingtypes

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BillingTypeRepo interface {
	Create(ctx context.Context, billingType *model.BillingType, userID string) (model.BillingType, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.BillingType, error)
	ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.BillingType, int, error)
	Update(ctx context.Context, billingType *model.BillingType, userID string) (model.BillingType, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type billingTypeRepo struct {
	DB *pgxpool.Pool
}

func NewBillingTypeRepo(db *pgxpool.Pool) BillingTypeRepo {
	return &billingTypeRepo{DB: db}
}

func (r *billingTypeRepo) Create(ctx context.Context, billingType *model.BillingType, userID string) (model.BillingType, error) {
	query := `
		INSERT INTO billing_types (id, hotel_id, name)
		SELECT $1::uuid, $2::uuid, $3
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $4::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, created_at, updated_at
	`

	var created model.BillingType

	err := r.DB.QueryRow(
		ctx, query,
		billingType.ID,
		billingType.HotelID,
		billingType.Name,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.BillingType{}, apperr.ErrBillingTypeNameExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.BillingType{}, apperr.ErrHotelNotFound
		}
		return model.BillingType{}, err
	}

	return created, nil
}

func (r *billingTypeRepo) Get(ctx context.Context, id, hotelID, userID string) (model.BillingType, error) {
	query := `
		SELECT id, hotel_id, name, created_at, updated_at
		FROM billing_types
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = billing_types.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var billingType model.BillingType

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&billingType.ID,
		&billingType.HotelID,
		&billingType.Name,
		&billingType.CreatedAt,
		&billingType.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.BillingType{}, apperr.ErrBillingTypeNotFound
		}
		return model.BillingType{}, err
	}

	return billingType, nil
}

func (r *billingTypeRepo) ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.BillingType, int, error) {
	query := `
		SELECT id, hotel_id, name, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM billing_types
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR name ILIKE '%' || $2 || '%')
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = billing_types.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	billingTypes := make([]model.BillingType, 0)
	var total int

	for rows.Next() {
		var billingType model.BillingType
		if err := rows.Scan(
			&billingType.ID,
			&billingType.HotelID,
			&billingType.Name,
			&billingType.CreatedAt,
			&billingType.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		billingTypes = append(billingTypes, billingType)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return billingTypes, total, nil
}

func (r *billingTypeRepo) Update(ctx context.Context, billingType *model.BillingType, userID string) (model.BillingType, error) {
	query := `
		UPDATE billing_types
		SET name = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = billing_types.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, created_at, updated_at
	`

	var updated model.BillingType

	err := r.DB.QueryRow(
		ctx, query,
		billingType.Name,
		billingType.ID,
		billingType.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.BillingType{}, apperr.ErrBillingTypeNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.BillingType{}, apperr.ErrBillingTypeNameExists
		}
		return model.BillingType{}, err
	}

	return updated, nil
}

func (r *billingTypeRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM billing_types
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = billing_types.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return apperr.ErrBillingTypeInUse
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrBillingTypeNotFound
	}

	return nil
}
