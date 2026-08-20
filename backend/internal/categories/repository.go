package categories

import (
	"context"
	"encoding/json"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryRepo interface {
	Create(ctx context.Context, category *model.Category, subMenuIDs []string, userID string) (model.Category, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Category, error)
	ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.Category, int, error)
	Update(ctx context.Context, id, hotelID, userID string, name *string, subMenuIDs []string) (model.Category, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type categoryRepo struct {
	DB *pgxpool.Pool
}

func NewCategoryRepo(db *pgxpool.Pool) CategoryRepo {
	return &categoryRepo{DB: db}
}

const categorySelect = `
	SELECT c.id, c.hotel_id, c.name, c.created_at, c.updated_at,
	       COALESCE(
	         json_agg(json_build_object('id', sm.id, 'name', sm.name) ORDER BY sm.name)
	           FILTER (WHERE sm.id IS NOT NULL),
	         '[]'
	       ) AS sub_menus
	FROM categories c
	LEFT JOIN category_sub_menus csm ON csm.category_id = c.id
	LEFT JOIN sub_menus sm ON sm.id = csm.sub_menu_id
`

func scanCategory(row pgx.Row) (model.Category, error) {
	var category model.Category
	var subMenusJSON []byte

	if err := row.Scan(
		&category.ID,
		&category.HotelID,
		&category.Name,
		&category.CreatedAt,
		&category.UpdatedAt,
		&subMenusJSON,
	); err != nil {
		return model.Category{}, err
	}

	if err := json.Unmarshal(subMenusJSON, &category.SubMenus); err != nil {
		return model.Category{}, err
	}
	if category.SubMenus == nil {
		category.SubMenus = []model.SubMenuRef{}
	}

	return category, nil
}

func (r *categoryRepo) Create(ctx context.Context, category *model.Category, subMenuIDs []string, userID string) (model.Category, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.Category{}, err
	}
	defer tx.Rollback(ctx)

	var created model.Category
	err = tx.QueryRow(ctx, `
		INSERT INTO categories (id, hotel_id, name)
		SELECT $1::uuid, $2::uuid, $3
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $4::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, created_at, updated_at
	`, category.ID, category.HotelID, category.Name, userID).Scan(
		&created.ID, &created.HotelID, &created.Name, &created.CreatedAt, &created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Category{}, apperr.ErrCategoryNameExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Category{}, apperr.ErrHotelNotFound
		}
		return model.Category{}, err
	}
	created.SubMenus = []model.SubMenuRef{}

	if _, err := tx.Exec(ctx, `
		INSERT INTO category_sub_menus (category_id, sub_menu_id)
		SELECT $1::uuid, unnest($2::uuid[])
	`, created.ID, subMenuIDs); err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return model.Category{}, apperr.ErrSubMenuNotFound
		}
		return model.Category{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return model.Category{}, err
	}

	return created, nil
}

func (r *categoryRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Category, error) {
	query := categorySelect + `
		WHERE c.id = $1::uuid AND c.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = c.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY c.id
	`

	category, err := scanCategory(r.DB.QueryRow(ctx, query, id, hotelID, userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Category{}, apperr.ErrCategoryNotFound
		}
		return model.Category{}, err
	}

	return category, nil
}

func (r *categoryRepo) ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.Category, int, error) {
	query := `
		SELECT c.id, c.hotel_id, c.name, c.created_at, c.updated_at,
		       COALESCE(
		         json_agg(json_build_object('id', sm.id, 'name', sm.name) ORDER BY sm.name)
		           FILTER (WHERE sm.id IS NOT NULL),
		         '[]'
		       ) AS sub_menus,
		       COUNT(*) OVER() AS total
		FROM categories c
		LEFT JOIN category_sub_menus csm ON csm.category_id = c.id
		LEFT JOIN sub_menus sm ON sm.id = csm.sub_menu_id
		WHERE c.hotel_id = $1::uuid
		  AND ($2 = '' OR c.name ILIKE '%' || $2 || '%')
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = c.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY c.id
		ORDER BY c.name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Category, 0)
	var total int

	for rows.Next() {
		var category model.Category
		var subMenusJSON []byte

		if err := rows.Scan(
			&category.ID,
			&category.HotelID,
			&category.Name,
			&category.CreatedAt,
			&category.UpdatedAt,
			&subMenusJSON,
			&total,
		); err != nil {
			return nil, 0, err
		}

		if err := json.Unmarshal(subMenusJSON, &category.SubMenus); err != nil {
			return nil, 0, err
		}
		if category.SubMenus == nil {
			category.SubMenus = []model.SubMenuRef{}
		}

		list = append(list, category)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *categoryRepo) Update(ctx context.Context, id, hotelID, userID string, name *string, subMenuIDs []string) (model.Category, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.Category{}, err
	}
	defer tx.Rollback(ctx)

	var updated model.Category
	err = tx.QueryRow(ctx, `
		UPDATE categories
		SET name = COALESCE($1, name), updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = categories.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, created_at, updated_at
	`, name, id, hotelID, userID).Scan(
		&updated.ID, &updated.HotelID, &updated.Name, &updated.CreatedAt, &updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Category{}, apperr.ErrCategoryNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Category{}, apperr.ErrCategoryNameExists
		}
		return model.Category{}, err
	}
	updated.SubMenus = []model.SubMenuRef{}

	if subMenuIDs != nil {
		if _, err := tx.Exec(ctx, `DELETE FROM category_sub_menus WHERE category_id = $1::uuid`, id); err != nil {
			return model.Category{}, err
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO category_sub_menus (category_id, sub_menu_id)
			SELECT $1::uuid, unnest($2::uuid[])
		`, id, subMenuIDs); err != nil {
			if apperr.IsForeignKeyViolation(err) {
				return model.Category{}, apperr.ErrSubMenuNotFound
			}
			return model.Category{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
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
