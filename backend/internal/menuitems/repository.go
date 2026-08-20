package menuitems

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/bimal009/atithi/internal/dishes"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MenuItemRepo interface {
	SearchDishes(ctx context.Context, search string, limit int) ([]model.Dish, error)
	FindOrCreateDish(ctx context.Context, name string, imageURL *string) (model.Dish, error)
	CreateWithDish(ctx context.Context, name string, imageURL *string, item *model.MenuItem, addOnIDs []string, userID string) (model.MenuItem, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.MenuItem, error)
	ListForHotel(ctx context.Context, hotelID, userID, categoryID, foodType string, pagination model.Pagination) ([]model.MenuItem, int, error)
	Update(ctx context.Context, item *model.MenuItem, addOnIDs []string, userID string) (model.MenuItem, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type menuItemRepo struct {
	DB *pgxpool.Pool
}

func NewMenuItemRepo(db *pgxpool.Pool) MenuItemRepo {
	return &menuItemRepo{DB: db}
}

const menuItemSelect = `
	SELECT mi.id, mi.hotel_id, mi.dish_id, d.name, d.image_url, mi.category_id, c.name, mi.food_type,
	       mi.price, mi.discount, mi.description, mi.ingredients, mi.available,
	       mi.created_at, mi.updated_at,
	       COALESCE(
	         json_agg(json_build_object('id', ao.id, 'name', ad.name, 'price', ao.price))
	           FILTER (WHERE ao.id IS NOT NULL),
	         '[]'
	       ) AS add_ons
	FROM menu_items mi
	JOIN dishes d ON d.id = mi.dish_id
	JOIN categories c ON c.id = mi.category_id
	LEFT JOIN menu_item_add_ons miao ON miao.menu_item_id = mi.id
	LEFT JOIN add_ons ao ON ao.id = miao.add_on_id
	LEFT JOIN dishes ad ON ad.id = ao.dish_id
`

func scanMenuItem(row pgx.Row) (model.MenuItem, error) {
	var item model.MenuItem
	var addOnsJSON []byte

	if err := row.Scan(
		&item.ID,
		&item.HotelID,
		&item.DishID,
		&item.Name,
		&item.ImageURL,
		&item.CategoryID,
		&item.CategoryName,
		&item.FoodType,
		&item.Price,
		&item.Discount,
		&item.Description,
		&item.Ingredients,
		&item.Available,
		&item.CreatedAt,
		&item.UpdatedAt,
		&addOnsJSON,
	); err != nil {
		return model.MenuItem{}, err
	}

	if err := json.Unmarshal(addOnsJSON, &item.AddOns); err != nil {
		return model.MenuItem{}, err
	}
	if item.AddOns == nil {
		item.AddOns = []model.AddOnRef{}
	}

	return item, nil
}

// linkAddOns replaces the set of add-ons offered with a menu item, scoping
// the insert to add-ons that belong to the same hotel.
func linkAddOns(ctx context.Context, tx pgx.Tx, menuItemID, hotelID string, addOnIDs []string) error {
	if _, err := tx.Exec(ctx, `DELETE FROM menu_item_add_ons WHERE menu_item_id = $1::uuid`, menuItemID); err != nil {
		return err
	}
	if len(addOnIDs) == 0 {
		return nil
	}

	_, err := tx.Exec(ctx, `
		INSERT INTO menu_item_add_ons (menu_item_id, add_on_id)
		SELECT $1::uuid, ao.id
		FROM add_ons ao
		WHERE ao.id = ANY($2::uuid[]) AND ao.hotel_id = $3::uuid
		ON CONFLICT DO NOTHING
	`, menuItemID, addOnIDs, hotelID)

	return err
}

func (r *menuItemRepo) SearchDishes(ctx context.Context, search string, limit int) ([]model.Dish, error) {
	query := `
		SELECT id, name, image_url, created_at, updated_at
		FROM dishes
		WHERE name ILIKE '%' || $1 || '%'
		ORDER BY name
		LIMIT $2
	`

	rows, err := r.DB.Query(ctx, query, search, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Dish, 0)

	for rows.Next() {
		var dish model.Dish
		if err := rows.Scan(
			&dish.ID,
			&dish.Name,
			&dish.ImageURL,
			&dish.CreatedAt,
			&dish.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, dish)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (r *menuItemRepo) FindOrCreateDish(ctx context.Context, name string, imageURL *string) (model.Dish, error) {
	return dishes.FindOrCreate(ctx, r.DB, name, imageURL)
}

// CreateWithDish finds-or-creates the shared dish, inserts the hotel's menu
// item, and links its add-ons, all in a single transaction.
func (r *menuItemRepo) CreateWithDish(ctx context.Context, name string, imageURL *string, item *model.MenuItem, addOnIDs []string, userID string) (model.MenuItem, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.MenuItem{}, err
	}
	defer tx.Rollback(ctx)

	dish, err := dishes.FindOrCreate(ctx, tx, name, imageURL)
	if err != nil {
		return model.MenuItem{}, err
	}
	item.DishID = dish.ID

	query := `
		INSERT INTO menu_items (id, hotel_id, dish_id, category_id, food_type, price, discount, description, ingredients, available)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $11::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, dish_id, category_id, food_type, price, discount, description, ingredients, available, created_at, updated_at
	`

	var created model.MenuItem

	err = tx.QueryRow(
		ctx, query,
		item.ID,
		item.HotelID,
		item.DishID,
		item.CategoryID,
		item.FoodType,
		item.Price,
		item.Discount,
		item.Description,
		item.Ingredients,
		item.Available,
		userID,
	).Scan(
		&created.ID, &created.HotelID, &created.DishID, &created.CategoryID, &created.FoodType,
		&created.Price, &created.Discount, &created.Description, &created.Ingredients, &created.Available,
		&created.CreatedAt, &created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.MenuItem{}, apperr.ErrMenuItemExists
		}
		if apperr.IsForeignKeyViolation(err) {
			return model.MenuItem{}, apperr.ErrCategoryNotFound
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.MenuItem{}, apperr.ErrHotelNotFound
		}
		return model.MenuItem{}, err
	}
	created.Name = dish.Name
	created.ImageURL = dish.ImageURL
	created.AddOns = []model.AddOnRef{}

	if err := linkAddOns(ctx, tx, created.ID, item.HotelID, addOnIDs); err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return model.MenuItem{}, apperr.ErrAddOnNotFound
		}
		return model.MenuItem{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return model.MenuItem{}, err
	}

	return created, nil
}

func (r *menuItemRepo) Get(ctx context.Context, id, hotelID, userID string) (model.MenuItem, error) {
	query := menuItemSelect + `
		WHERE mi.id = $1::uuid AND mi.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = mi.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY mi.id, d.id, c.id
	`

	item, err := scanMenuItem(r.DB.QueryRow(ctx, query, id, hotelID, userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.MenuItem{}, apperr.ErrMenuItemNotFound
		}
		return model.MenuItem{}, err
	}

	return item, nil
}

func (r *menuItemRepo) ListForHotel(ctx context.Context, hotelID, userID, categoryID, foodType string, pagination model.Pagination) ([]model.MenuItem, int, error) {
	query := `
		SELECT mi.id, mi.hotel_id, mi.dish_id, d.name, d.image_url, mi.category_id, c.name, mi.food_type,
		       mi.price, mi.discount, mi.description, mi.ingredients, mi.available,
		       mi.created_at, mi.updated_at,
		       COALESCE(
		         json_agg(json_build_object('id', ao.id, 'name', ad.name, 'price', ao.price))
		           FILTER (WHERE ao.id IS NOT NULL),
		         '[]'
		       ) AS add_ons,
		       COUNT(*) OVER() AS total
		FROM menu_items mi
		JOIN dishes d ON d.id = mi.dish_id
		JOIN categories c ON c.id = mi.category_id
		LEFT JOIN menu_item_add_ons miao ON miao.menu_item_id = mi.id
		LEFT JOIN add_ons ao ON ao.id = miao.add_on_id
		LEFT JOIN dishes ad ON ad.id = ao.dish_id
		WHERE mi.hotel_id = $1::uuid
		  AND ($2 = '' OR d.name ILIKE '%' || $2 || '%')
		  AND (NULLIF($6, '') IS NULL OR mi.category_id = NULLIF($6, '')::uuid)
		  AND ($7 = '' OR mi.food_type = $7)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = mi.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY mi.id, d.id, c.id
		ORDER BY d.name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset(), categoryID, foodType)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.MenuItem, 0)
	var total int

	for rows.Next() {
		var item model.MenuItem
		var addOnsJSON []byte
		if err := rows.Scan(
			&item.ID,
			&item.HotelID,
			&item.DishID,
			&item.Name,
			&item.ImageURL,
			&item.CategoryID,
			&item.CategoryName,
			&item.FoodType,
			&item.Price,
			&item.Discount,
			&item.Description,
			&item.Ingredients,
			&item.Available,
			&item.CreatedAt,
			&item.UpdatedAt,
			&addOnsJSON,
			&total,
		); err != nil {
			return nil, 0, err
		}
		if err := json.Unmarshal(addOnsJSON, &item.AddOns); err != nil {
			return nil, 0, err
		}
		if item.AddOns == nil {
			item.AddOns = []model.AddOnRef{}
		}
		list = append(list, item)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *menuItemRepo) Update(ctx context.Context, item *model.MenuItem, addOnIDs []string, userID string) (model.MenuItem, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.MenuItem{}, err
	}
	defer tx.Rollback(ctx)

	query := `
		UPDATE menu_items
		SET
			category_id = $1,
			food_type = $2,
			price = $3,
			discount = $4,
			description = $5,
			ingredients = $6,
			available = $7,
			updated_at = now()
		WHERE id = $8::uuid AND hotel_id = $9::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = menu_items.hotel_id AND m.user_id = $10::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, category_id, food_type, price, discount, description, ingredients, available, created_at, updated_at
	`

	updated := *item

	err = tx.QueryRow(
		ctx, query,
		item.CategoryID,
		item.FoodType,
		item.Price,
		item.Discount,
		item.Description,
		item.Ingredients,
		item.Available,
		item.ID,
		item.HotelID,
		userID,
	).Scan(
		&updated.ID, &updated.HotelID, &updated.CategoryID, &updated.FoodType, &updated.Price,
		&updated.Discount, &updated.Description, &updated.Ingredients, &updated.Available,
		&updated.CreatedAt, &updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.MenuItem{}, apperr.ErrMenuItemNotFound
		}
		if apperr.IsForeignKeyViolation(err) {
			return model.MenuItem{}, apperr.ErrCategoryNotFound
		}
		return model.MenuItem{}, err
	}
	updated.CategoryName = ""
	updated.AddOns = []model.AddOnRef{}

	if addOnIDs != nil {
		if err := linkAddOns(ctx, tx, updated.ID, item.HotelID, addOnIDs); err != nil {
			if apperr.IsForeignKeyViolation(err) {
				return model.MenuItem{}, apperr.ErrAddOnNotFound
			}
			return model.MenuItem{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return model.MenuItem{}, err
	}

	return updated, nil
}

func (r *menuItemRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM menu_items
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = menu_items.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrMenuItemNotFound
	}

	return nil
}
