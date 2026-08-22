package gallery

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GalleryRepo interface {
	Create(ctx context.Context, hotelID, url, userID string) (model.GalleryImage, error)
	ListForHotel(ctx context.Context, hotelID, userID string) ([]model.GalleryImage, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type galleryRepo struct {
	DB *pgxpool.Pool
}

func NewGalleryRepo(db *pgxpool.Pool) GalleryRepo {
	return &galleryRepo{DB: db}
}

func (r *galleryRepo) Create(ctx context.Context, hotelID, url, userID string) (model.GalleryImage, error) {
	query := `
		INSERT INTO hotel_gallery_images (id, hotel_id, url, position)
		SELECT gen_random_uuid(), $1::uuid, $2::text,
		       COALESCE((SELECT MAX(position) + 1 FROM hotel_gallery_images WHERE hotel_id = $1::uuid), 0)
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $1::uuid AND m.user_id = $3::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, url, position, created_at
	`

	var created model.GalleryImage

	err := r.DB.QueryRow(ctx, query, hotelID, url, userID).Scan(
		&created.ID,
		&created.HotelID,
		&created.URL,
		&created.Position,
		&created.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.GalleryImage{}, apperr.ErrHotelNotFound
		}
		return model.GalleryImage{}, err
	}

	return created, nil
}

func (r *galleryRepo) ListForHotel(ctx context.Context, hotelID, userID string) ([]model.GalleryImage, error) {
	query := `
		SELECT id, hotel_id, url, position, created_at
		FROM hotel_gallery_images
		WHERE hotel_id = $1::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotel_gallery_images.hotel_id AND m.user_id = $2::uuid AND m.status = 'active'
		  )
		ORDER BY position, created_at
	`

	rows, err := r.DB.Query(ctx, query, hotelID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.GalleryImage, 0)

	for rows.Next() {
		var img model.GalleryImage
		if err := rows.Scan(&img.ID, &img.HotelID, &img.URL, &img.Position, &img.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, img)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (r *galleryRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM hotel_gallery_images
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = hotel_gallery_images.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrGalleryImageNotFound
	}

	return nil
}
