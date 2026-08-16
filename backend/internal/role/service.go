package role

import (
	"context"
	"log/slog"

	"github.com/bimal009/atithi/internal/member"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/permission"
)

type RoleService interface {
	ListRoles(ctx context.Context, hotelID string) (ListRolesResponse, error)
}

type roleService struct {
	slog        *slog.Logger
	repo        RoleRepo
	permissions permission.PermissionRepo
	members     member.MemberRepo
}

func NewRoleService(
	slog *slog.Logger,
	repo RoleRepo,
	permissions permission.PermissionRepo,
	members member.MemberRepo,
) RoleService {
	return &roleService{
		slog:        slog,
		repo:        repo,
		permissions: permissions,
		members:     members,
	}
}

func (s *roleService) ListRoles(ctx context.Context, hotelID string) (ListRolesResponse, error) {
	roles, err := s.repo.ListForHotel(ctx, hotelID)
	if err != nil {
		return ListRolesResponse{}, err
	}

	counts, err := s.members.CountByRole(ctx, hotelID)
	if err != nil {
		return ListRolesResponse{}, err
	}

	out := make([]RoleResponse, len(roles))
	for i, r := range roles {
		perms, err := s.permissions.ListByRole(ctx, r.ID)
		if err != nil {
			return ListRolesResponse{}, err
		}
		out[i] = toRoleResponse(r, perms, counts[r.ID])
	}

	return ListRolesResponse{Roles: out}, nil
}

func toRoleResponse(r model.HotelRole, perms []model.Permission, memberCount int) RoleResponse {
	permResponses := make([]PermissionResponse, len(perms))
	for i, p := range perms {
		permResponses[i] = PermissionResponse{
			ID:          p.ID,
			Resource:    p.Resource,
			Action:      p.Action,
			Description: p.Description,
		}
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
		MemberCount: memberCount,
		Permissions: permResponses,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}
