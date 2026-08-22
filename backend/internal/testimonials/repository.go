package testimonials

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TestimonialRepo interface {
	Create(ctx context.Context, testimonial *model.Testimonial, userID string) (model.Testimonial, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Testimonial, error)
	ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.Testimonial, int, error)
	ListPublic(ctx context.Context, hotelID string) ([]model.Testimonial, error)
	Update(ctx context.Context, testimonial *model.Testimonial, userID string) (model.Testimonial, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type testimonialRepo struct {
	DB *pgxpool.Pool
}

func NewTestimonialRepo(db *pgxpool.Pool) TestimonialRepo {
	return &testimonialRepo{DB: db}
}

func (r *testimonialRepo) Create(ctx context.Context, testimonial *model.Testimonial, userID string) (model.Testimonial, error) {
	query := `
		INSERT INTO testimonials (id, hotel_id, guest_name, stay_label, quote, rating)
		SELECT $1::uuid, $2::uuid, $3, $4, $5, $6::smallint
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $7::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, guest_name, stay_label, quote, rating, created_at, updated_at
	`

	var created model.Testimonial

	err := r.DB.QueryRow(
		ctx, query,
		testimonial.ID,
		testimonial.HotelID,
		testimonial.GuestName,
		testimonial.StayLabel,
		testimonial.Quote,
		testimonial.Rating,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.GuestName,
		&created.StayLabel,
		&created.Quote,
		&created.Rating,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Testimonial{}, apperr.ErrHotelNotFound
		}
		return model.Testimonial{}, err
	}

	return created, nil
}

func (r *testimonialRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Testimonial, error) {
	query := `
		SELECT id, hotel_id, guest_name, stay_label, quote, rating, created_at, updated_at
		FROM testimonials
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = testimonials.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var t model.Testimonial

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&t.ID, &t.HotelID, &t.GuestName, &t.StayLabel, &t.Quote, &t.Rating, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Testimonial{}, apperr.ErrTestimonialNotFound
		}
		return model.Testimonial{}, err
	}

	return t, nil
}

func (r *testimonialRepo) ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.Testimonial, int, error) {
	query := `
		SELECT id, hotel_id, guest_name, stay_label, quote, rating, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM testimonials
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR guest_name ILIKE '%' || $2 || '%')
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = testimonials.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY created_at DESC
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Testimonial, 0)
	var total int

	for rows.Next() {
		var t model.Testimonial
		if err := rows.Scan(
			&t.ID, &t.HotelID, &t.GuestName, &t.StayLabel, &t.Quote, &t.Rating, &t.CreatedAt, &t.UpdatedAt, &total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, t)
	}

	return list, total, rows.Err()
}

func (r *testimonialRepo) ListPublic(ctx context.Context, hotelID string) ([]model.Testimonial, error) {
	query := `
		SELECT id, hotel_id, guest_name, stay_label, quote, rating, created_at, updated_at
		FROM testimonials
		WHERE hotel_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT 20
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Testimonial, 0)
	for rows.Next() {
		var t model.Testimonial
		if err := rows.Scan(
			&t.ID, &t.HotelID, &t.GuestName, &t.StayLabel, &t.Quote, &t.Rating, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, t)
	}

	return list, rows.Err()
}

func (r *testimonialRepo) Update(ctx context.Context, testimonial *model.Testimonial, userID string) (model.Testimonial, error) {
	query := `
		UPDATE testimonials
		SET
			guest_name = $1,
			stay_label = $2,
			quote = $3,
			rating = $4::smallint,
			updated_at = now()
		WHERE id = $5::uuid AND hotel_id = $6::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = testimonials.hotel_id AND m.user_id = $7::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, guest_name, stay_label, quote, rating, created_at, updated_at
	`

	var updated model.Testimonial

	err := r.DB.QueryRow(
		ctx, query,
		testimonial.GuestName,
		testimonial.StayLabel,
		testimonial.Quote,
		testimonial.Rating,
		testimonial.ID,
		testimonial.HotelID,
		userID,
	).Scan(
		&updated.ID, &updated.HotelID, &updated.GuestName, &updated.StayLabel, &updated.Quote, &updated.Rating,
		&updated.CreatedAt, &updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Testimonial{}, apperr.ErrTestimonialNotFound
		}
		return model.Testimonial{}, err
	}

	return updated, nil
}

func (r *testimonialRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM testimonials
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = testimonials.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrTestimonialNotFound
	}

	return nil
}
