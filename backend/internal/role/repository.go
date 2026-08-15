package role

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Slugs of the global roles seeded by migration 000004.
const (
	SlugOwner = "owner"
	SlugAdmin = "admin"
)

type RoleRepo interface {
	Create(ctx context.Context, role *model.HotelRole, permissionIDs []string, tx pgx.Tx) (model.HotelRole, error)
	Get(ctx context.Context, id string) (model.HotelRole, error)
	GetBySlug(ctx context.Context, hotelID *string, slug string) (model.HotelRole, error)
	ListForHotel(ctx context.Context, hotelID string) ([]model.HotelRole, error)
	ListGlobal(ctx context.Context) ([]model.HotelRole, error)
	Update(ctx context.Context, role *model.HotelRole) (model.HotelRole, error)
	Delete(ctx context.Context, id string) error
	SetPermissions(ctx context.Context, roleID string, permissionIDs []string, tx pgx.Tx) error
}

type roleRepo struct {
	DB *pgxpool.Pool
}

func NewRoleRepo(db *pgxpool.Pool) RoleRepo {
	return &roleRepo{
		DB: db,
	}
}

func (r *roleRepo) Create(ctx context.Context, role *model.HotelRole, permissionIDs []string, tx pgx.Tx) (model.HotelRole, error) {
	query := `
		INSERT INTO roles (hotel_id, name, slug, description, is_system, created_by)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, hotel_id, name, slug, description, is_system, created_by, created_at, updated_at
	`

	var created model.HotelRole

	err := tx.QueryRow(
		ctx, query,
		role.HotelID,
		role.Name,
		role.Slug,
		role.Description,
		role.IsSystem,
		role.CreatedBy,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.Slug,
		&created.Description,
		&created.IsSystem,
		&created.CreatedBy,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.HotelRole{}, apperr.ErrRoleSlugExists
		}
		return model.HotelRole{}, err
	}

	if err := r.SetPermissions(ctx, created.ID, permissionIDs, tx); err != nil {
		return model.HotelRole{}, err
	}

	return created, nil
}

func (r *roleRepo) Get(ctx context.Context, id string) (model.HotelRole, error) {
	query := `
		SELECT id, hotel_id, name, slug, description, is_system, created_by, created_at, updated_at
		FROM roles
		WHERE id = $1
	`

	var role model.HotelRole

	err := r.DB.QueryRow(ctx, query, id).Scan(
		&role.ID,
		&role.HotelID,
		&role.Name,
		&role.Slug,
		&role.Description,
		&role.IsSystem,
		&role.CreatedBy,
		&role.CreatedAt,
		&role.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.HotelRole{}, apperr.ErrRoleNotFound
		}
		return model.HotelRole{}, err
	}

	return role, nil
}

func (r *roleRepo) GetBySlug(ctx context.Context, hotelID *string, slug string) (model.HotelRole, error) {
	query := `
		SELECT id, hotel_id, name, slug, description, is_system, created_by, created_at, updated_at
		FROM roles
		WHERE hotel_id IS NOT DISTINCT FROM $1::uuid AND slug = $2
	`

	var role model.HotelRole

	err := r.DB.QueryRow(ctx, query, hotelID, slug).Scan(
		&role.ID,
		&role.HotelID,
		&role.Name,
		&role.Slug,
		&role.Description,
		&role.IsSystem,
		&role.CreatedBy,
		&role.CreatedAt,
		&role.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.HotelRole{}, apperr.ErrRoleNotFound
		}
		return model.HotelRole{}, err
	}

	return role, nil
}

func (r *roleRepo) ListForHotel(ctx context.Context, hotelID string) ([]model.HotelRole, error) {
	query := `
		SELECT id, hotel_id, name, slug, description, is_system, created_by, created_at, updated_at
		FROM roles
		WHERE hotel_id IS NULL OR hotel_id = $1
		ORDER BY is_system DESC, name
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	roles := make([]model.HotelRole, 0)

	for rows.Next() {
		var role model.HotelRole
		if err := rows.Scan(
			&role.ID,
			&role.HotelID,
			&role.Name,
			&role.Slug,
			&role.Description,
			&role.IsSystem,
			&role.CreatedBy,
			&role.CreatedAt,
			&role.UpdatedAt,
		); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

func (r *roleRepo) ListGlobal(ctx context.Context) ([]model.HotelRole, error) {
	query := `
		SELECT id, hotel_id, name, slug, description, is_system, created_by, created_at, updated_at
		FROM roles
		WHERE hotel_id IS NULL
		ORDER BY name
	`

	rows, err := r.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	roles := make([]model.HotelRole, 0)

	for rows.Next() {
		var role model.HotelRole
		if err := rows.Scan(
			&role.ID,
			&role.HotelID,
			&role.Name,
			&role.Slug,
			&role.Description,
			&role.IsSystem,
			&role.CreatedBy,
			&role.CreatedAt,
			&role.UpdatedAt,
		); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

func (r *roleRepo) Update(ctx context.Context, role *model.HotelRole) (model.HotelRole, error) {
	query := `
		UPDATE roles
		SET name = $1, slug = $2, description = $3, updated_at = now()
		WHERE id = $4 AND is_system = false
		RETURNING id, hotel_id, name, slug, description, is_system, created_by, created_at, updated_at
	`

	var updated model.HotelRole

	err := r.DB.QueryRow(
		ctx, query,
		role.Name,
		role.Slug,
		role.Description,
		role.ID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.Slug,
		&updated.Description,
		&updated.IsSystem,
		&updated.CreatedBy,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.HotelRole{}, apperr.ErrRoleNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.HotelRole{}, apperr.ErrRoleSlugExists
		}
		return model.HotelRole{}, err
	}

	return updated, nil
}

func (r *roleRepo) Delete(ctx context.Context, id string) error {
	result, err := r.DB.Exec(ctx, `DELETE FROM roles WHERE id = $1 AND is_system = false`, id)
	if err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return apperr.ErrRoleInUse
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrRoleNotFound
	}

	return nil
}

func (r *roleRepo) SetPermissions(ctx context.Context, roleID string, permissionIDs []string, tx pgx.Tx) error {
	if _, err := tx.Exec(ctx, `DELETE FROM role_permissions WHERE role_id = $1`, roleID); err != nil {
		return err
	}

	if len(permissionIDs) == 0 {
		return nil
	}

	query := `
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT $1, id FROM unnest($2::uuid[]) AS p(id)
	`

	if _, err := tx.Exec(ctx, query, roleID, permissionIDs); err != nil {
		if apperr.IsForeignKeyViolation(err) {
			return apperr.ErrPermissionNotFound
		}
		return err
	}

	return nil
}
