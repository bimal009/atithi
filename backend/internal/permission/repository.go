package permission

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PermissionRepo interface {
	Create(ctx context.Context, permission *model.Permission) (model.Permission, error)
	Get(ctx context.Context, id string) (model.Permission, error)
	GetByResourceAction(ctx context.Context, resource, action string) (model.Permission, error)
	GetAll(ctx context.Context) ([]model.Permission, error)
	ListByRole(ctx context.Context, roleID string) ([]model.Permission, error)
	GetByMember(ctx context.Context, memberID string, hotelID string) ([]model.Permission, error)
	Update(ctx context.Context, permission *model.Permission) (model.Permission, error)
	Delete(ctx context.Context, id string) error
}

type permissionRepo struct {
	DB *pgxpool.Pool
}

func NewPermissionRepo(db *pgxpool.Pool) PermissionRepo {
	return &permissionRepo{
		DB: db,
	}
}

func (r *permissionRepo) Create(ctx context.Context, permission *model.Permission) (model.Permission, error) {
	query := `
		INSERT INTO permissions (resource, action, description)
		VALUES ($1, $2, $3)
		RETURNING id, resource, action, description, created_at
	`

	var created model.Permission

	err := r.DB.QueryRow(
		ctx, query,
		permission.Resource,
		permission.Action,
		permission.Description,
	).Scan(
		&created.ID,
		&created.Resource,
		&created.Action,
		&created.Description,
		&created.CreatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Permission{}, apperr.ErrPermissionExists
		}
		return model.Permission{}, err
	}

	return created, nil
}

func (r *permissionRepo) Get(ctx context.Context, id string) (model.Permission, error) {
	query := `
		SELECT id, resource, action, description, created_at
		FROM permissions
		WHERE id = $1
	`

	var permission model.Permission

	err := r.DB.QueryRow(ctx, query, id).Scan(
		&permission.ID,
		&permission.Resource,
		&permission.Action,
		&permission.Description,
		&permission.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Permission{}, apperr.ErrPermissionNotFound
		}
		return model.Permission{}, err
	}

	return permission, nil
}

func (r *permissionRepo) GetByResourceAction(ctx context.Context, resource, action string) (model.Permission, error) {
	query := `
		SELECT id, resource, action, description, created_at
		FROM permissions
		WHERE resource = $1 AND action = $2
	`

	var permission model.Permission

	err := r.DB.QueryRow(ctx, query, resource, action).Scan(
		&permission.ID,
		&permission.Resource,
		&permission.Action,
		&permission.Description,
		&permission.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Permission{}, apperr.ErrPermissionNotFound
		}
		return model.Permission{}, err
	}

	return permission, nil
}

func (r *permissionRepo) GetAll(ctx context.Context) ([]model.Permission, error) {
	query := `
		SELECT id, resource, action, description, created_at
		FROM permissions
		ORDER BY resource, action
	`

	rows, err := r.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	permissions := make([]model.Permission, 0)

	for rows.Next() {
		var permission model.Permission
		if err := rows.Scan(
			&permission.ID,
			&permission.Resource,
			&permission.Action,
			&permission.Description,
			&permission.CreatedAt,
		); err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return permissions, nil
}

func (r *permissionRepo) ListByRole(ctx context.Context, roleID string) ([]model.Permission, error) {
	query := `
		SELECT p.id, p.resource, p.action, p.description, p.created_at
		FROM permissions p
		JOIN role_permissions rp ON rp.permission_id = p.id
		WHERE rp.role_id = $1
		ORDER BY p.resource, p.action
	`

	rows, err := r.DB.Query(ctx, query, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	permissions := make([]model.Permission, 0)

	for rows.Next() {
		var permission model.Permission
		if err := rows.Scan(
			&permission.ID,
			&permission.Resource,
			&permission.Action,
			&permission.Description,
			&permission.CreatedAt,
		); err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return permissions, nil
}

func (r *permissionRepo) Update(ctx context.Context, permission *model.Permission) (model.Permission, error) {
	query := `
		UPDATE permissions
		SET resource = $1, action = $2, description = $3
		WHERE id = $4
		RETURNING id, resource, action, description, created_at
	`

	var updated model.Permission

	err := r.DB.QueryRow(
		ctx, query,
		permission.Resource,
		permission.Action,
		permission.Description,
		permission.ID,
	).Scan(
		&updated.ID,
		&updated.Resource,
		&updated.Action,
		&updated.Description,
		&updated.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Permission{}, apperr.ErrPermissionNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Permission{}, apperr.ErrPermissionExists
		}
		return model.Permission{}, err
	}

	return updated, nil
}

func (r *permissionRepo) Delete(ctx context.Context, id string) error {
	result, err := r.DB.Exec(ctx, `DELETE FROM permissions WHERE id = $1`, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrPermissionNotFound
	}

	return nil
}

func (r *permissionRepo) GetByMember(ctx context.Context, memberID string, hotelID string) ([]model.Permission, error) {
	query := `
		SELECT p.id, p.resource, p.action, p.description, p.created_at
		FROM members m
		JOIN role_permissions rp ON rp.role_id = m.role_id
		JOIN permissions p ON p.id = rp.permission_id
		WHERE m.hotel_id = $1::uuid
		  AND m.id = $2::uuid
		  AND m.status = 'active'
		ORDER BY p.resource, p.action
	`

	rows, err := r.DB.Query(ctx, query, hotelID, memberID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	permissions := make([]model.Permission, 0)

	for rows.Next() {
		var permission model.Permission
		if err := rows.Scan(
			&permission.ID,
			&permission.Resource,
			&permission.Action,
			&permission.Description,
			&permission.CreatedAt,
		); err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return permissions, nil
}
