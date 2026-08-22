package hotelimages

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelImageRepo interface {
	Create(ctx context.Context, img *model.HotelImage, userID string) (model.HotelImage, error)
	ListForHotel(ctx context.Context, hotelID, userID, entityType string, entityID *string) ([]model.HotelImage, error)
	CountForEntity(ctx context.Context, hotelID, entityType string, entityID *string) (int, error)
	Delete(ctx context.Context, id, hotelID, userID string) (model.HotelImage, error)
}

type hotelImageRepo struct {
	DB *pgxpool.Pool
}

func NewHotelImageRepo(db *pgxpool.Pool) HotelImageRepo {
	return &hotelImageRepo{DB: db}
}

func scanHotelImage(row scannable, img *model.HotelImage) error {
	return row.Scan(
		&img.ID, &img.HotelID, &img.EntityType, &img.EntityID,
		&img.URL, &img.FileID, &img.FileSize, &img.Section,
		&img.Position, &img.CreatedAt,
	)
}

type scannable interface {
	Scan(dest ...any) error
}

func (r *hotelImageRepo) Create(ctx context.Context, img *model.HotelImage, userID string) (model.HotelImage, error) {
	query := `
		INSERT INTO hotel_images (id, hotel_id, entity_type, entity_id, url, file_id, file_size, section, position)
		SELECT gen_random_uuid(), $1::uuid, $2::text, $3::uuid, $4::text, $5::text, $6::int, $7::text,
		       COALESCE((
		         SELECT MAX(position) + 1 FROM hotel_images
		         WHERE hotel_id = $1::uuid AND entity_type = $2::text
		           AND entity_id IS NOT DISTINCT FROM $3::uuid
		       ), 0)
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $1::uuid AND m.user_id = $8::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, entity_type, entity_id, url, file_id, file_size, section, position, created_at
	`

	var created model.HotelImage
	err := scanHotelImage(
		r.DB.QueryRow(ctx, query, img.HotelID, img.EntityType, img.EntityID, img.URL, img.FileID, img.FileSize, img.Section, userID),
		&created,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.HotelImage{}, apperr.ErrHotelNotFound
		}
		return model.HotelImage{}, err
	}

	return created, nil
}

func (r *hotelImageRepo) ListForHotel(ctx context.Context, hotelID, userID, entityType string, entityID *string) ([]model.HotelImage, error) {
	query := `
		SELECT id, hotel_id, entity_type, entity_id, url, file_id, file_size, section, position, created_at
		FROM hotel_images
		WHERE hotel_id = $1::uuid
		  AND entity_type = $2::text
		  AND entity_id IS NOT DISTINCT FROM $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotel_images.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		ORDER BY position, created_at
	`

	rows, err := r.DB.Query(ctx, query, hotelID, entityType, entityID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.HotelImage, 0)
	for rows.Next() {
		var img model.HotelImage
		if err := scanHotelImage(rows, &img); err != nil {
			return nil, err
		}
		list = append(list, img)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (r *hotelImageRepo) CountForEntity(ctx context.Context, hotelID, entityType string, entityID *string) (int, error) {
	query := `
		SELECT COUNT(*) FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = $2::text AND entity_id IS NOT DISTINCT FROM $3::uuid
	`
	var count int
	err := r.DB.QueryRow(ctx, query, hotelID, entityType, entityID).Scan(&count)
	return count, err
}

func (r *hotelImageRepo) Delete(ctx context.Context, id, hotelID, userID string) (model.HotelImage, error) {
	query := `
		DELETE FROM hotel_images
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotel_images.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, entity_type, entity_id, url, file_id, file_size, section, position, created_at
	`

	var deleted model.HotelImage
	err := scanHotelImage(r.DB.QueryRow(ctx, query, id, hotelID, userID), &deleted)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.HotelImage{}, apperr.ErrHotelImageNotFound
		}
		return model.HotelImage{}, err
	}

	return deleted, nil
}
