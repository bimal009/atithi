package addons

import (
	"context"
	"errors"

	"github.com/bimal009/atithi/internal/dishes"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AddOnRepo interface {
	FindOrCreateDish(ctx context.Context, name string, imageURL *string) (model.Dish, error)
	CreateWithDish(ctx context.Context, name string, imageURL *string, addOn *model.AddOn, userID string) (model.AddOn, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.AddOn, error)
	ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.AddOn, int, error)
	Update(ctx context.Context, addOn *model.AddOn, userID string) (model.AddOn, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
	GetPricesTx(ctx context.Context, tx pgx.Tx, ids []string, hotelID string) (map[string]float64, error)
}

type addOnRepo struct {
	DB *pgxpool.Pool
}

func NewAddOnRepo(db *pgxpool.Pool) AddOnRepo {
	return &addOnRepo{DB: db}
}

func (r *addOnRepo) FindOrCreateDish(ctx context.Context, name string, imageURL *string) (model.Dish, error) {
	return dishes.FindOrCreate(ctx, r.DB, name, imageURL)
}

func (r *addOnRepo) CreateWithDish(ctx context.Context, name string, imageURL *string, addOn *model.AddOn, userID string) (model.AddOn, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.AddOn{}, err
	}
	defer tx.Rollback(ctx)

	dish, err := dishes.FindOrCreate(ctx, tx, name, imageURL)
	if err != nil {
		return model.AddOn{}, err
	}
	addOn.DishID = dish.ID

	query := `
		INSERT INTO add_ons (id, hotel_id, dish_id, price, available)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4, $5
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $6::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, dish_id, price, available, created_at, updated_at
	`

	var created model.AddOn

	err = tx.QueryRow(
		ctx, query,
		addOn.ID,
		addOn.HotelID,
		addOn.DishID,
		addOn.Price,
		addOn.Available,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.DishID,
		&created.Price,
		&created.Available,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.AddOn{}, apperr.ErrAddOnExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.AddOn{}, apperr.ErrHotelNotFound
		}
		return model.AddOn{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return model.AddOn{}, err
	}

	created.Name = dish.Name
	created.ImageURL = dish.ImageURL

	return created, nil
}

func (r *addOnRepo) Get(ctx context.Context, id, hotelID, userID string) (model.AddOn, error) {
	query := `
		SELECT a.id, a.hotel_id, a.dish_id, d.name, d.image_url, a.price, a.available,
		       a.created_at, a.updated_at
		FROM add_ons a
		JOIN dishes d ON d.id = a.dish_id
		WHERE a.id = $1::uuid AND a.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = a.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var addOn model.AddOn

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&addOn.ID,
		&addOn.HotelID,
		&addOn.DishID,
		&addOn.Name,
		&addOn.ImageURL,
		&addOn.Price,
		&addOn.Available,
		&addOn.CreatedAt,
		&addOn.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.AddOn{}, apperr.ErrAddOnNotFound
		}
		return model.AddOn{}, err
	}

	return addOn, nil
}

func (r *addOnRepo) ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.AddOn, int, error) {
	query := `
		SELECT a.id, a.hotel_id, a.dish_id, d.name, d.image_url, a.price, a.available,
		       a.created_at, a.updated_at,
		       COUNT(*) OVER() AS total
		FROM add_ons a
		JOIN dishes d ON d.id = a.dish_id
		WHERE a.hotel_id = $1::uuid
		  AND ($2 = '' OR d.name ILIKE '%' || $2 || '%')
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = a.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY d.name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.AddOn, 0)
	var total int

	for rows.Next() {
		var addOn model.AddOn
		if err := rows.Scan(
			&addOn.ID,
			&addOn.HotelID,
			&addOn.DishID,
			&addOn.Name,
			&addOn.ImageURL,
			&addOn.Price,
			&addOn.Available,
			&addOn.CreatedAt,
			&addOn.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, addOn)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *addOnRepo) Update(ctx context.Context, addOn *model.AddOn, userID string) (model.AddOn, error) {
	query := `
		UPDATE add_ons
		SET price = $1, available = $2, updated_at = now()
		WHERE id = $3::uuid AND hotel_id = $4::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = add_ons.hotel_id AND m.user_id = $5::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, dish_id, price, available, created_at, updated_at
	`

	var updated model.AddOn

	err := r.DB.QueryRow(
		ctx, query,
		addOn.Price,
		addOn.Available,
		addOn.ID,
		addOn.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.DishID,
		&updated.Price,
		&updated.Available,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.AddOn{}, apperr.ErrAddOnNotFound
		}
		return model.AddOn{}, err
	}

	updated.Name = addOn.Name
	updated.ImageURL = addOn.ImageURL

	return updated, nil
}

func (r *addOnRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM add_ons
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = add_ons.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrAddOnNotFound
	}

	return nil
}

func (r *addOnRepo) GetPricesTx(ctx context.Context, tx pgx.Tx, ids []string, hotelID string) (map[string]float64, error) {
	rows, err := tx.Query(ctx, `
		SELECT id, price FROM add_ons WHERE id = ANY($1::uuid[]) AND hotel_id = $2::uuid
	`, ids, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	prices := make(map[string]float64, len(ids))
	for rows.Next() {
		var id string
		var price float64
		if err := rows.Scan(&id, &price); err != nil {
			return nil, err
		}
		prices[id] = price
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return prices, nil
}
