package submenus

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SubMenuRepo interface {
	Create(ctx context.Context, subMenu *model.SubMenu, userID string) (model.SubMenu, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.SubMenu, error)
	ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.SubMenu, int, error)
	Update(ctx context.Context, subMenu *model.SubMenu, userID string) (model.SubMenu, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type subMenuRepo struct {
	DB *pgxpool.Pool
}

func NewSubMenuRepo(db *pgxpool.Pool) SubMenuRepo {
	return &subMenuRepo{DB: db}
}

func (r *subMenuRepo) Create(ctx context.Context, subMenu *model.SubMenu, userID string) (model.SubMenu, error) {
	query := `
		INSERT INTO sub_menus (id, hotel_id, name, description)
		SELECT $1::uuid, $2::uuid, $3, $4
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $5::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, description, created_at, updated_at
	`

	var created model.SubMenu

	err := r.DB.QueryRow(
		ctx, query,
		subMenu.ID,
		subMenu.HotelID,
		subMenu.Name,
		subMenu.Description,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.Description,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.SubMenu{}, apperr.ErrSubMenuNameExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.SubMenu{}, apperr.ErrHotelNotFound
		}
		return model.SubMenu{}, err
	}

	return created, nil
}

func (r *subMenuRepo) Get(ctx context.Context, id, hotelID, userID string) (model.SubMenu, error) {
	query := `
		SELECT id, hotel_id, name, description, created_at, updated_at
		FROM sub_menus
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sub_menus.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var subMenu model.SubMenu

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&subMenu.ID,
		&subMenu.HotelID,
		&subMenu.Name,
		&subMenu.Description,
		&subMenu.CreatedAt,
		&subMenu.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.SubMenu{}, apperr.ErrSubMenuNotFound
		}
		return model.SubMenu{}, err
	}

	return subMenu, nil
}

func (r *subMenuRepo) ListForHotel(ctx context.Context, hotelID, userID string, pagination model.Pagination) ([]model.SubMenu, int, error) {
	query := `
		SELECT id, hotel_id, name, description, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM sub_menus
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR name ILIKE '%' || $2 || '%')
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sub_menus.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY name
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.SubMenu, 0)
	var total int

	for rows.Next() {
		var subMenu model.SubMenu
		if err := rows.Scan(
			&subMenu.ID,
			&subMenu.HotelID,
			&subMenu.Name,
			&subMenu.Description,
			&subMenu.CreatedAt,
			&subMenu.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, subMenu)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *subMenuRepo) Update(ctx context.Context, subMenu *model.SubMenu, userID string) (model.SubMenu, error) {
	query := `
		UPDATE sub_menus
		SET name = $1, description = $2, updated_at = now()
		WHERE id = $3::uuid AND hotel_id = $4::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sub_menus.hotel_id AND m.user_id = $5::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, description, created_at, updated_at
	`

	var updated model.SubMenu

	err := r.DB.QueryRow(
		ctx, query,
		subMenu.Name,
		subMenu.Description,
		subMenu.ID,
		subMenu.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.Description,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.SubMenu{}, apperr.ErrSubMenuNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.SubMenu{}, apperr.ErrSubMenuNameExists
		}
		return model.SubMenu{}, err
	}

	return updated, nil
}

func (r *subMenuRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM sub_menus
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = sub_menus.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return apperr.ErrSubMenuInUse
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrSubMenuNotFound
	}

	return nil
}
