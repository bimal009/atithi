package menuitems

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MenuItemRepo interface {
	SearchDishes(ctx context.Context, search string, limit int) ([]model.Dish, error)
	FindOrCreateDish(ctx context.Context, name string, imageURL *string) (model.Dish, error)
	Create(ctx context.Context, item *model.MenuItem, userID string) (model.MenuItem, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.MenuItem, error)
	ListForHotel(ctx context.Context, hotelID, userID, categoryID, foodType string, pagination model.Pagination) ([]model.MenuItem, int, error)
	Update(ctx context.Context, item *model.MenuItem, userID string) (model.MenuItem, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type menuItemRepo struct {
	DB *pgxpool.Pool
}

func NewMenuItemRepo(db *pgxpool.Pool) MenuItemRepo {
	return &menuItemRepo{DB: db}
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
	query := `
		INSERT INTO dishes (id, name, image_url)
		VALUES (gen_random_uuid(), $1, $2)
		ON CONFLICT (lower(name)) DO UPDATE
			SET image_url = COALESCE(EXCLUDED.image_url, dishes.image_url),
			    updated_at = now()
		RETURNING id, name, image_url, created_at, updated_at
	`

	var dish model.Dish

	err := r.DB.QueryRow(ctx, query, name, imageURL).Scan(
		&dish.ID,
		&dish.Name,
		&dish.ImageURL,
		&dish.CreatedAt,
		&dish.UpdatedAt,
	)
	if err != nil {
		return model.Dish{}, err
	}

	return dish, nil
}

func (r *menuItemRepo) Create(ctx context.Context, item *model.MenuItem, userID string) (model.MenuItem, error) {
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

	err := r.DB.QueryRow(
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
		&created.ID,
		&created.HotelID,
		&created.DishID,
		&created.CategoryID,
		&created.FoodType,
		&created.Price,
		&created.Discount,
		&created.Description,
		&created.Ingredients,
		&created.Available,
		&created.CreatedAt,
		&created.UpdatedAt,
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

	created.Name = item.Name
	created.ImageURL = item.ImageURL
	created.CategoryName = item.CategoryName

	return created, nil
}

func (r *menuItemRepo) Get(ctx context.Context, id, hotelID, userID string) (model.MenuItem, error) {
	query := `
		SELECT mi.id, mi.hotel_id, mi.dish_id, d.name, d.image_url, mi.category_id, c.name, mi.food_type,
		       mi.price, mi.discount, mi.description, mi.ingredients, mi.available,
		       mi.created_at, mi.updated_at
		FROM menu_items mi
		JOIN dishes d ON d.id = mi.dish_id
		JOIN categories c ON c.id = mi.category_id
		WHERE mi.id = $1::uuid AND mi.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = mi.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var item model.MenuItem

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
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
	)

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
		       COUNT(*) OVER() AS total
		FROM menu_items mi
		JOIN dishes d ON d.id = mi.dish_id
		JOIN categories c ON c.id = mi.category_id
		WHERE mi.hotel_id = $1::uuid
		  AND ($2 = '' OR d.name ILIKE '%' || $2 || '%')
		  AND (NULLIF($6, '') IS NULL OR mi.category_id = NULLIF($6, '')::uuid)
		  AND ($7 = '' OR mi.food_type = $7)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = mi.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
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
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, item)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *menuItemRepo) Update(ctx context.Context, item *model.MenuItem, userID string) (model.MenuItem, error) {
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
		RETURNING id, hotel_id, dish_id, category_id, food_type, price, discount, description, ingredients, available, created_at, updated_at
	`

	var updated model.MenuItem

	err := r.DB.QueryRow(
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
		&updated.ID,
		&updated.HotelID,
		&updated.DishID,
		&updated.CategoryID,
		&updated.FoodType,
		&updated.Price,
		&updated.Discount,
		&updated.Description,
		&updated.Ingredients,
		&updated.Available,
		&updated.CreatedAt,
		&updated.UpdatedAt,
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

	updated.Name = item.Name
	updated.ImageURL = item.ImageURL

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
