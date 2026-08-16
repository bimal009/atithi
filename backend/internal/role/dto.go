package role

import "time"

type PermissionResponse struct {
	ID          string  `json:"id"`
	Resource    string  `json:"resource"`
	Action      string  `json:"action"`
	Description *string `json:"description,omitempty"`
}

type ListPermissionsResponse struct {
	Permissions []PermissionResponse `json:"permissions"`
}

type CreateRoleRequest struct {
	Name          string   `json:"name" validate:"required,min=2,max=100"`
	Description   *string  `json:"description,omitempty" validate:"omitempty,max=500"`
	PermissionIDs []string `json:"permissionIds" validate:"required,min=1,dive,uuid"`
}

type UpdateRoleRequest struct {
	Name          *string  `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Description   *string  `json:"description,omitempty" validate:"omitempty,max=500"`
	PermissionIDs []string `json:"permissionIds,omitempty" validate:"omitempty,min=1,dive,uuid"`
}

type RoleResponse struct {
	ID          string               `json:"id"`
	HotelID     string               `json:"hotelId"`
	Name        string               `json:"name"`
	Slug        string               `json:"slug"`
	Description *string              `json:"description,omitempty"`
	IsSystem    bool                 `json:"isSystem"`
	MemberCount int                  `json:"memberCount"`
	Permissions []PermissionResponse `json:"permissions"`
	CreatedAt   time.Time            `json:"createdAt"`
	UpdatedAt   time.Time            `json:"updatedAt"`
}

type RoleSummaryResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	IsSystem bool   `json:"isSystem"`
}

type ListRolesResponse struct {
	Roles []RoleResponse `json:"roles"`
}
