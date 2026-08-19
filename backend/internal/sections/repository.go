package sections

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SectionRepo interface {
	Create(ctx context.Context, section *model.Section, userID string) (model.Section, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Section, error)
	ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.Section, int, error)
	Update(ctx context.Context, section *model.Section, userID string) (model.Section, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type sectionRepo struct {
	DB *pgxpool.Pool
}

func NewSectionRepo(db *pgxpool.Pool) SectionRepo {
	return &sectionRepo{DB: db}
}

func (r *sectionRepo) Create(ctx context.Context, section *model.Section, userID string) (model.Section, error) {
	query := `
		INSERT INTO sections (id, hotel_id, name)
		SELECT $1::uuid, $2::uuid, $3
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $4::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, created_at, updated_at
	`

	var created model.Section

	err := r.DB.QueryRow(
		ctx, query,
		section.ID,
		section.HotelID,
		section.Name,
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
			return model.Section{}, apperr.ErrSectionNameExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Section{}, apperr.ErrHotelNotFound
		}
		return model.Section{}, err
	}

	return created, nil
}

func (r *sectionRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Section, error) {
	query := `
		SELECT id, hotel_id, name, created_at, updated_at
		FROM sections
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sections.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var section model.Section

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&section.ID,
		&section.HotelID,
		&section.Name,
		&section.CreatedAt,
		&section.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Section{}, apperr.ErrSectionNotFound
		}
		return model.Section{}, err
	}

	return section, nil
}

func (r *sectionRepo) ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.Section, int, error) {
	query := `
		SELECT id, hotel_id, name, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM sections
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR name ILIKE '%' || $2 || '%')
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sections.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Section, 0)
	var total int

	for rows.Next() {
		var section model.Section
		if err := rows.Scan(
			&section.ID,
			&section.HotelID,
			&section.Name,
			&section.CreatedAt,
			&section.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, section)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *sectionRepo) Update(ctx context.Context, section *model.Section, userID string) (model.Section, error) {
	query := `
		UPDATE sections
		SET name = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sections.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, created_at, updated_at
	`

	var updated model.Section

	err := r.DB.QueryRow(
		ctx, query,
		section.Name,
		section.ID,
		section.HotelID,
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
			return model.Section{}, apperr.ErrSectionNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Section{}, apperr.ErrSectionNameExists
		}
		return model.Section{}, err
	}

	return updated, nil
}

func (r *sectionRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM sections
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sections.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return apperr.ErrSectionInUse
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrSectionNotFound
	}

	return nil
}
