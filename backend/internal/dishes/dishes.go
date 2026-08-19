package dishes

import (
	"context"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/jackc/pgx/v5"
)

type DBTX interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

func FindOrCreate(ctx context.Context, q DBTX, name string, imageURL *string) (model.Dish, error) {
	query := `
		INSERT INTO dishes (id, name, image_url)
		VALUES (gen_random_uuid(), $1, $2)
		ON CONFLICT (lower(name)) DO UPDATE
			SET image_url = EXCLUDED.image_url,
			    updated_at = now()
		RETURNING id, name, image_url, created_at, updated_at
	`

	var dish model.Dish

	err := q.QueryRow(ctx, query, name, imageURL).Scan(
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
