package categories

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryRepo interface {
	Create(ctx context.Context, category *model.Category, userID string) (model.Category, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Category, error)
	ListForHotel(ctx context.Context, hotelID, userID string) ([]model.Category, error)
	Update(ctx context.Context, category *model.Category, userID string) (model.Category, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type categoryRepo struct {
	DB *pgxpool.Pool
}

func NewCategoryRepo(db *pgxpool.Pool) CategoryRepo {
	return &categoryRepo{DB: db}
}

func (r *categoryRepo) Create(ctx context.Context, category *model.Category, userID string) (model.Category, error) {
	query := `
		INSERT INTO categories (id, hotel_id, name, sub_menu_id)
		SELECT $1::uuid, $2::uuid, $3, $4::uuid
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $5::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, sub_menu_id, created_at, updated_at
	`

	var created model.Category

	err := r.DB.QueryRow(
		ctx, query,
		category.ID,
		category.HotelID,
		category.Name,
		category.SubMenuID,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.SubMenuID,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Category{}, apperr.ErrCategoryNameExists
		}
		if apperr.IsForeignKeyViolation(err) {
			return model.Category{}, apperr.ErrSubMenuNotFound
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Category{}, apperr.ErrHotelNotFound
		}
		return model.Category{}, err
	}

	return created, nil
}

func (r *categoryRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Category, error) {
	query := `
		SELECT c.id, c.hotel_id, c.name, c.sub_menu_id, sm.name, c.created_at, c.updated_at
		FROM categories c
		LEFT JOIN sub_menus sm ON sm.id = c.sub_menu_id
		WHERE c.id = $1::uuid AND c.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = c.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var category model.Category

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&category.ID,
		&category.HotelID,
		&category.Name,
		&category.SubMenuID,
		&category.SubMenuName,
		&category.CreatedAt,
		&category.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Category{}, apperr.ErrCategoryNotFound
		}
		return model.Category{}, err
	}

	return category, nil
}

func (r *categoryRepo) ListForHotel(ctx context.Context, hotelID, userID string) ([]model.Category, error) {
	query := `
		SELECT c.id, c.hotel_id, c.name, c.sub_menu_id, sm.name, c.created_at, c.updated_at
		FROM categories c
		LEFT JOIN sub_menus sm ON sm.id = c.sub_menu_id
		WHERE c.hotel_id = $1::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = c.hotel_id AND m.user_id = $2::uuid AND m.status = 'active'
		  )
		ORDER BY c.name
	`

	rows, err := r.DB.Query(ctx, query, hotelID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Category, 0)

	for rows.Next() {
		var category model.Category
		if err := rows.Scan(
			&category.ID,
			&category.HotelID,
			&category.Name,
			&category.SubMenuID,
			&category.SubMenuName,
			&category.CreatedAt,
			&category.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, category)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (r *categoryRepo) Update(ctx context.Context, category *model.Category, userID string) (model.Category, error) {
	query := `
		UPDATE categories
		SET name = $1, sub_menu_id = $2, updated_at = now()
		WHERE id = $3::uuid AND hotel_id = $4::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = categories.hotel_id AND m.user_id = $5::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, sub_menu_id, created_at, updated_at
	`

	var updated model.Category

	err := r.DB.QueryRow(
		ctx, query,
		category.Name,
		category.SubMenuID,
		category.ID,
		category.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.SubMenuID,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Category{}, apperr.ErrCategoryNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Category{}, apperr.ErrCategoryNameExists
		}
		if apperr.IsForeignKeyViolation(err) {
			return model.Category{}, apperr.ErrSubMenuNotFound
		}
		return model.Category{}, err
	}

	return updated, nil
}

func (r *categoryRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM categories
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = categories.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return apperr.ErrCategoryInUse
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrCategoryNotFound
	}

	return nil
}
