package permission

import (
	"context"

	model "github.com/bimal009/atithi/internal/models"
)

type PermissionService interface {
	GetPermissionsForRole(ctx context.Context, roleID string) ([]model.Permission, error)
}

type permissionService struct {
	repo PermissionRepo
}

func NewPermissionService(repo PermissionRepo) PermissionService {
	return &permissionService{repo: repo}
}

func (s *permissionService) GetPermissionsForRole(ctx context.Context, roleID string) ([]model.Permission, error) {
	return s.repo.ListByRole(ctx, roleID)
}
