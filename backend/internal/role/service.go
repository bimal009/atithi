package role

import (
	"context"
	"fmt"
	"log/slog"
	"regexp"
	"strings"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/permission"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/jackc/pgx/v5/pgxpool"
)

var slugCollapse = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(name string) string {
	s := slugCollapse.ReplaceAllString(strings.ToLower(name), "-")
	return strings.Trim(s, "-")
}

type RoleService interface {
	ListPermissions(ctx context.Context) (ListPermissionsResponse, error)
	ListRoles(ctx context.Context, hotelID string) (ListRolesResponse, error)
	ListSystemRoles(ctx context.Context, hotelID string) (ListRolesResponse, error)
	ListHotelRoles(ctx context.Context, hotelID string) (ListRolesResponse, error)
	ListAssignableRoles(ctx context.Context, hotelID string) (ListRolesResponse, error)
	Get(ctx context.Context, id, hotelID string) (RoleResponse, error)
	Create(ctx context.Context, hotelID, userID string, req *CreateRoleRequest) (RoleResponse, error)
	Update(ctx context.Context, id, hotelID string, req *UpdateRoleRequest) (RoleResponse, error)
	Delete(ctx context.Context, id, hotelID string) error
}

type roleService struct {
	slog        *slog.Logger
	repo        RoleRepo
	permissions permission.PermissionRepo
	DB          *pgxpool.Pool
}

func NewRoleService(
	slog *slog.Logger,
	repo RoleRepo,
	permissions permission.PermissionRepo,
	db *pgxpool.Pool,
) RoleService {
	return &roleService{
		slog:        slog,
		repo:        repo,
		permissions: permissions,
		DB:          db,
	}
}

func (s *roleService) ListPermissions(ctx context.Context) (ListPermissionsResponse, error) {
	all, err := s.permissions.GetAll(ctx)
	if err != nil {
		return ListPermissionsResponse{}, err
	}

	out := make([]PermissionResponse, len(all))
	for i, p := range all {
		out[i] = toPermissionResponse(p)
	}

	return ListPermissionsResponse{Permissions: out}, nil
}

func (s *roleService) ListRoles(ctx context.Context, hotelID string) (ListRolesResponse, error) {
	roles, err := s.repo.ListForHotel(ctx, hotelID)
	if err != nil {
		return ListRolesResponse{}, err
	}

	return s.buildRolesResponse(roles), nil
}

func (s *roleService) ListSystemRoles(ctx context.Context, hotelID string) (ListRolesResponse, error) {
	roles, err := s.repo.ListGlobal(ctx)
	if err != nil {
		return ListRolesResponse{}, err
	}

	return s.buildRolesResponse(roles), nil
}

func (s *roleService) ListHotelRoles(ctx context.Context, hotelID string) (ListRolesResponse, error) {
	roles, err := s.repo.ListCustomForHotel(ctx, hotelID)
	if err != nil {
		return ListRolesResponse{}, err
	}

	return s.buildRolesResponse(roles), nil
}

func (s *roleService) ListAssignableRoles(ctx context.Context, hotelID string) (ListRolesResponse, error) {
	roles, err := s.repo.ListAssignableForHotel(ctx, hotelID)
	if err != nil {
		return ListRolesResponse{}, err
	}

	return s.buildRolesResponse(roles), nil
}

func (s *roleService) buildRolesResponse(roles []model.HotelRole) ListRolesResponse {
	out := make([]RoleSummaryResponse, len(roles))
	for i, r := range roles {
		out[i] = toRoleSummaryResponse(r)
	}

	return ListRolesResponse{Roles: out}
}

func (s *roleService) Get(ctx context.Context, id, hotelID string) (RoleResponse, error) {
	r, err := s.repo.Get(ctx, id)
	if err != nil {
		return RoleResponse{}, err
	}
	if r.HotelID != nil && *r.HotelID != hotelID {
		return RoleResponse{}, apperr.ErrRoleNotFound
	}

	perms, err := s.permissions.ListByRole(ctx, r.ID)
	if err != nil {
		return RoleResponse{}, err
	}

	return toRoleResponse(r, perms), nil
}

func (s *roleService) Create(ctx context.Context, hotelID, userID string, req *CreateRoleRequest) (RoleResponse, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return RoleResponse{}, err
	}

	slug := slugify(req.Name)
	if slug == SlugOwner {
		return RoleResponse{}, apperr.ErrOwnerRoleReserved
	}

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return RoleResponse{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	newRole := &model.HotelRole{
		HotelID:     &hotelID,
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		IsSystem:    false,
		CreatedBy:   &userID,
	}

	created, err := s.repo.Create(ctx, newRole, req.PermissionIDs, tx)
	if err != nil {
		s.slog.Error("failed to create role", "hotel_id", hotelID, "error", err)
		return RoleResponse{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return RoleResponse{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.slog.Info("role created", "role_id", created.ID, "hotel_id", hotelID)

	return toRoleResponse(created, nil), nil
}

func (s *roleService) Update(ctx context.Context, id, hotelID string, req *UpdateRoleRequest) (RoleResponse, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return RoleResponse{}, err
	}

	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		return RoleResponse{}, err
	}
	if existing.IsSystem {
		return RoleResponse{}, apperr.ErrSystemRoleImmutable
	}
	if existing.HotelID == nil || *existing.HotelID != hotelID {
		return RoleResponse{}, apperr.ErrRoleNotFound
	}

	if req.Name != nil {
		slug := slugify(*req.Name)
		if slug == SlugOwner {
			return RoleResponse{}, apperr.ErrOwnerRoleReserved
		}
		existing.Name = *req.Name
		existing.Slug = slug
	}
	if req.Description != nil {
		existing.Description = req.Description
	}

	updated, err := s.repo.Update(ctx, &existing)
	if err != nil {
		s.slog.Error("failed to update role", "role_id", id, "error", err)
		return RoleResponse{}, err
	}

	if req.PermissionIDs != nil {
		tx, err := s.DB.Begin(ctx)
		if err != nil {
			return RoleResponse{}, fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer tx.Rollback(ctx)

		if err := s.repo.SetPermissions(ctx, id, req.PermissionIDs, tx); err != nil {
			return RoleResponse{}, err
		}

		if err := tx.Commit(ctx); err != nil {
			return RoleResponse{}, fmt.Errorf("failed to commit transaction: %w", err)
		}
	}

	s.slog.Info("role updated", "role_id", id)

	return toRoleResponse(updated, nil), nil
}

func (s *roleService) Delete(ctx context.Context, id, hotelID string) error {
	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		return err
	}
	if existing.IsSystem {
		return apperr.ErrSystemRoleImmutable
	}
	if existing.HotelID == nil || *existing.HotelID != hotelID {
		return apperr.ErrRoleNotFound
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		s.slog.Error("failed to delete role", "role_id", id, "error", err)
		return err
	}

	s.slog.Info("role deleted", "role_id", id)

	return nil
}

func toPermissionResponse(p model.Permission) PermissionResponse {
	return PermissionResponse{
		ID:          p.ID,
		Resource:    p.Resource,
		Action:      p.Action,
		Description: p.Description,
	}
}

func toRoleResponse(r model.HotelRole, perms []model.Permission) RoleResponse {
	permResponses := make([]PermissionResponse, len(perms))
	for i, p := range perms {
		permResponses[i] = toPermissionResponse(p)
	}

	var hotelID string
	if r.HotelID != nil {
		hotelID = *r.HotelID
	}

	return RoleResponse{
		ID:          r.ID,
		HotelID:     hotelID,
		Name:        r.Name,
		Slug:        r.Slug,
		Description: r.Description,
		IsSystem:    r.IsSystem,
		Permissions: permResponses,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}

func toRoleSummaryResponse(r model.HotelRole) RoleSummaryResponse {
	var hotelID string
	if r.HotelID != nil {
		hotelID = *r.HotelID
	}

	return RoleSummaryResponse{
		ID:          r.ID,
		HotelID:     hotelID,
		Name:        r.Name,
		Slug:        r.Slug,
		Description: r.Description,
		IsSystem:    r.IsSystem,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}
