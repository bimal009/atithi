package tables

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TableRepo interface {
	Create(ctx context.Context, table *model.Table, userID string) (model.Table, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Table, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Table, int, error)
	Update(ctx context.Context, table *model.Table, userID string) (model.Table, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Table, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type tableRepo struct {
	DB *pgxpool.Pool
}

func NewTableRepo(db *pgxpool.Pool) TableRepo {
	return &tableRepo{DB: db}
}

func (r *tableRepo) imagesForTable(ctx context.Context, tableID string) ([]string, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT url FROM hotel_images
		WHERE entity_type = 'table' AND entity_id = $1::uuid
		ORDER BY position, created_at
	`, tableID)
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

func (r *tableRepo) imagesForTables(ctx context.Context, hotelID string) (map[string][]string, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT entity_id, url FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = 'table'
		ORDER BY position, created_at
	`, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byTable := map[string][]string{}
	for rows.Next() {
		var tableID *string
		var url string
		if err := rows.Scan(&tableID, &url); err != nil {
			return nil, err
		}
		if tableID == nil {
			continue
		}
		byTable[*tableID] = append(byTable[*tableID], url)
	}
	return byTable, rows.Err()
}

func (r *tableRepo) Create(ctx context.Context, table *model.Table, userID string) (model.Table, error) {
	query := `
		INSERT INTO dining_tables (id, hotel_id, name, capacity, section_id, status)
		SELECT $1::uuid, $2::uuid, $3, $4, $5, $6
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $7::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, capacity, section_id, status, created_at, updated_at
	`

	var created model.Table

	err := r.DB.QueryRow(
		ctx, query,
		table.ID,
		table.HotelID,
		table.Name,
		table.Capacity,
		table.SectionID,
		table.Status,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.Capacity,
		&created.SectionID,
		&created.Status,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Table{}, apperr.ErrTableNameExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Table{}, apperr.ErrHotelNotFound
		}
		return model.Table{}, err
	}

	created.Images = []string{}
	return created, nil
}

func (r *tableRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Table, error) {
	query := `
		SELECT id, hotel_id, name, capacity, section_id, status, created_at, updated_at
		FROM dining_tables
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = dining_tables.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var table model.Table

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&table.ID,
		&table.HotelID,
		&table.Name,
		&table.Capacity,
		&table.SectionID,
		&table.Status,
		&table.CreatedAt,
		&table.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Table{}, apperr.ErrTableNotFound
		}
		return model.Table{}, err
	}

	images, err := r.imagesForTable(ctx, table.ID)
	if err != nil {
		return model.Table{}, err
	}
	table.Images = images

	return table, nil
}

func (r *tableRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Table, int, error) {
	query := `
		SELECT id, hotel_id, name, capacity, section_id, status, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM dining_tables
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR name ILIKE '%' || $2 || '%')
		  AND ($6 = '' OR status = $6)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = dining_tables.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset(), status)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Table, 0)
	var total int

	for rows.Next() {
		var table model.Table
		if err := rows.Scan(
			&table.ID,
			&table.HotelID,
			&table.Name,
			&table.Capacity,
			&table.SectionID,
			&table.Status,
			&table.CreatedAt,
			&table.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, table)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	imagesByTable, err := r.imagesForTables(ctx, hotelID)
	if err != nil {
		return nil, 0, err
	}
	for i := range list {
		if imgs, ok := imagesByTable[list[i].ID]; ok {
			list[i].Images = imgs
		} else {
			list[i].Images = []string{}
		}
	}

	return list, total, nil
}

func (r *tableRepo) Update(ctx context.Context, table *model.Table, userID string) (model.Table, error) {
	query := `
		UPDATE dining_tables
		SET
			name = $1,
			capacity = $2,
			section_id = $3,
			updated_at = now()
		WHERE id = $4::uuid AND hotel_id = $5::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = dining_tables.hotel_id AND m.user_id = $6::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, capacity, section_id, status, created_at, updated_at
	`

	var updated model.Table

	err := r.DB.QueryRow(
		ctx, query,
		table.Name,
		table.Capacity,
		table.SectionID,
		table.ID,
		table.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.Capacity,
		&updated.SectionID,
		&updated.Status,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Table{}, apperr.ErrTableNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Table{}, apperr.ErrTableNameExists
		}
		return model.Table{}, err
	}

	images, err := r.imagesForTable(ctx, updated.ID)
	if err != nil {
		return model.Table{}, err
	}
	updated.Images = images

	return updated, nil
}

func (r *tableRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Table, error) {
	query := `
		UPDATE dining_tables
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = dining_tables.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, capacity, section_id, status, created_at, updated_at
	`

	var updated model.Table

	err := r.DB.QueryRow(ctx, query, status, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.Capacity,
		&updated.SectionID,
		&updated.Status,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Table{}, apperr.ErrTableNotFound
		}
		return model.Table{}, err
	}

	images, err := r.imagesForTable(ctx, updated.ID)
	if err != nil {
		return model.Table{}, err
	}
	updated.Images = images

	return updated, nil
}

func (r *tableRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM dining_tables
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = dining_tables.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrTableNotFound
	}

	if _, err := r.DB.Exec(ctx, `DELETE FROM hotel_images WHERE entity_type = 'table' AND entity_id = $1::uuid`, id); err != nil {
		return err
	}

	return nil
}
