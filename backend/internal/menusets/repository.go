package menusets

import (
	"context"
	"encoding/json"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MenuSetRepo interface {
	Create(ctx context.Context, menuSet *model.MenuSet, items []MenuSetItemInput, userID string) (model.MenuSet, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.MenuSet, error)
	ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.MenuSet, int, error)
	Update(ctx context.Context, id, hotelID, userID string, name, description *string, price *float64, available *bool, items []MenuSetItemInput) (model.MenuSet, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type menuSetRepo struct {
	DB *pgxpool.Pool
}

func NewMenuSetRepo(db *pgxpool.Pool) MenuSetRepo {
	return &menuSetRepo{DB: db}
}

const menuSetSelect = `
	SELECT ms.id, ms.hotel_id, ms.name, ms.description, ms.price, ms.available,
	       ms.created_at, ms.updated_at,
	       COALESCE(
	         json_agg(json_build_object('id', mi.id, 'name', d.name, 'price', mi.price, 'quantity', msi.quantity))
	           FILTER (WHERE mi.id IS NOT NULL),
	         '[]'
	       ) AS items
	FROM menu_sets ms
	LEFT JOIN menu_set_items msi ON msi.menu_set_id = ms.id
	LEFT JOIN menu_items mi ON mi.id = msi.menu_item_id
	LEFT JOIN dishes d ON d.id = mi.dish_id
`

func scanMenuSet(row pgx.Row) (model.MenuSet, error) {
	var menuSet model.MenuSet
	var itemsJSON []byte

	if err := row.Scan(
		&menuSet.ID,
		&menuSet.HotelID,
		&menuSet.Name,
		&menuSet.Description,
		&menuSet.Price,
		&menuSet.Available,
		&menuSet.CreatedAt,
		&menuSet.UpdatedAt,
		&itemsJSON,
	); err != nil {
		return model.MenuSet{}, err
	}

	if err := json.Unmarshal(itemsJSON, &menuSet.Items); err != nil {
		return model.MenuSet{}, err
	}
	if menuSet.Items == nil {
		menuSet.Items = []model.MenuSetItemRef{}
	}

	return menuSet, nil
}

// linkItems replaces the set of menu items bundled into a menu set, scoping
// the insert to menu items that belong to the same hotel.
func linkItems(ctx context.Context, tx pgx.Tx, menuSetID, hotelID string, items []MenuSetItemInput) error {
	if _, err := tx.Exec(ctx, `DELETE FROM menu_set_items WHERE menu_set_id = $1::uuid`, menuSetID); err != nil {
		return err
	}
	if len(items) == 0 {
		return nil
	}

	ids := make([]string, len(items))
	quantities := make([]int, len(items))
	for i, it := range items {
		ids[i] = it.MenuItemID
		quantities[i] = it.Quantity
	}

	_, err := tx.Exec(ctx, `
		INSERT INTO menu_set_items (menu_set_id, menu_item_id, quantity)
		SELECT $1::uuid, x.menu_item_id, x.quantity
		FROM unnest($2::uuid[], $3::int[]) AS x(menu_item_id, quantity)
		JOIN menu_items mi ON mi.id = x.menu_item_id AND mi.hotel_id = $4::uuid
	`, menuSetID, ids, quantities, hotelID)

	return err
}

func (r *menuSetRepo) Create(ctx context.Context, menuSet *model.MenuSet, items []MenuSetItemInput, userID string) (model.MenuSet, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.MenuSet{}, err
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO menu_sets (id, hotel_id, name, description, price, available)
		SELECT $1::uuid, $2::uuid, $3, $4, $5, $6
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $7::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, description, price, available, created_at, updated_at
	`

	var created model.MenuSet

	err = tx.QueryRow(
		ctx, query,
		menuSet.ID,
		menuSet.HotelID,
		menuSet.Name,
		menuSet.Description,
		menuSet.Price,
		menuSet.Available,
		userID,
	).Scan(
		&created.ID, &created.HotelID, &created.Name, &created.Description,
		&created.Price, &created.Available, &created.CreatedAt, &created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.MenuSet{}, apperr.ErrMenuSetNameExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.MenuSet{}, apperr.ErrHotelNotFound
		}
		return model.MenuSet{}, err
	}
	created.Items = []model.MenuSetItemRef{}

	if err := linkItems(ctx, tx, created.ID, menuSet.HotelID, items); err != nil {
		return model.MenuSet{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return model.MenuSet{}, err
	}

	return created, nil
}

func (r *menuSetRepo) Get(ctx context.Context, id, hotelID, userID string) (model.MenuSet, error) {
	query := menuSetSelect + `
		WHERE ms.id = $1::uuid AND ms.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = ms.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY ms.id
	`

	menuSet, err := scanMenuSet(r.DB.QueryRow(ctx, query, id, hotelID, userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.MenuSet{}, apperr.ErrMenuSetNotFound
		}
		return model.MenuSet{}, err
	}

	return menuSet, nil
}

func (r *menuSetRepo) ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.MenuSet, int, error) {
	query := `
		SELECT ms.id, ms.hotel_id, ms.name, ms.description, ms.price, ms.available,
		       ms.created_at, ms.updated_at,
		       COALESCE(
		         json_agg(json_build_object('id', mi.id, 'name', d.name, 'price', mi.price, 'quantity', msi.quantity))
		           FILTER (WHERE mi.id IS NOT NULL),
		         '[]'
		       ) AS items,
		       COUNT(*) OVER() AS total
		FROM menu_sets ms
		LEFT JOIN menu_set_items msi ON msi.menu_set_id = ms.id
		LEFT JOIN menu_items mi ON mi.id = msi.menu_item_id
		LEFT JOIN dishes d ON d.id = mi.dish_id
		WHERE ms.hotel_id = $1::uuid
		  AND ($2 = '' OR ms.name ILIKE '%' || $2 || '%')
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = ms.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY ms.id
		ORDER BY ms.name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.MenuSet, 0)
	var total int

	for rows.Next() {
		var menuSet model.MenuSet
		var itemsJSON []byte
		if err := rows.Scan(
			&menuSet.ID,
			&menuSet.HotelID,
			&menuSet.Name,
			&menuSet.Description,
			&menuSet.Price,
			&menuSet.Available,
			&menuSet.CreatedAt,
			&menuSet.UpdatedAt,
			&itemsJSON,
			&total,
		); err != nil {
			return nil, 0, err
		}
		if err := json.Unmarshal(itemsJSON, &menuSet.Items); err != nil {
			return nil, 0, err
		}
		if menuSet.Items == nil {
			menuSet.Items = []model.MenuSetItemRef{}
		}
		list = append(list, menuSet)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *menuSetRepo) Update(ctx context.Context, id, hotelID, userID string, name, description *string, price *float64, available *bool, items []MenuSetItemInput) (model.MenuSet, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.MenuSet{}, err
	}
	defer tx.Rollback(ctx)

	query := `
		UPDATE menu_sets
		SET
			name = COALESCE($1, name),
			description = CASE WHEN $2::boolean THEN $3 ELSE description END,
			price = COALESCE($4, price),
			available = COALESCE($5, available),
			updated_at = now()
		WHERE id = $6::uuid AND hotel_id = $7::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = menu_sets.hotel_id AND m.user_id = $8::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, description, price, available, created_at, updated_at
	`

	var updated model.MenuSet

	err = tx.QueryRow(
		ctx, query,
		name,
		description != nil,
		description,
		price,
		available,
		id,
		hotelID,
		userID,
	).Scan(
		&updated.ID, &updated.HotelID, &updated.Name, &updated.Description,
		&updated.Price, &updated.Available, &updated.CreatedAt, &updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.MenuSet{}, apperr.ErrMenuSetNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.MenuSet{}, apperr.ErrMenuSetNameExists
		}
		return model.MenuSet{}, err
	}
	updated.Items = []model.MenuSetItemRef{}

	if items != nil {
		if err := linkItems(ctx, tx, updated.ID, hotelID, items); err != nil {
			return model.MenuSet{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return model.MenuSet{}, err
	}

	return updated, nil
}

func (r *menuSetRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM menu_sets
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = menu_sets.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrMenuSetNotFound
	}

	return nil
}
