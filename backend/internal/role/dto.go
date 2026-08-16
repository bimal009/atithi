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
	Permissions []PermissionResponse `json:"permissions"`
	CreatedAt   time.Time            `json:"createdAt"`
	UpdatedAt   time.Time            `json:"updatedAt"`
}

// RoleSummaryResponse is the lightweight shape returned by the list
// endpoints — no embedded permissions. Fetch a role by id (RoleResponse) to
// see its actual permissions.
type RoleSummaryResponse struct {
	ID          string    `json:"id"`
	HotelID     string    `json:"hotelId"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description,omitempty"`
	IsSystem    bool      `json:"isSystem"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ListRolesResponse struct {
	Roles []RoleSummaryResponse `json:"roles"`
}
