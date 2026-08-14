package model

import (
	"time"
)

type Permission struct {
	ID          string    `db:"id" json:"id"`
	Resource    string    `db:"resource" json:"resource"`
	Action      string    `db:"action" json:"action"`
	Description *string   `db:"description" json:"description,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
}

type HotelRole struct {
	ID          string    `db:"id" json:"id"`
	HotelID     string    `db:"hotel_id" json:"hotelId"`
	Name        string    `db:"name" json:"name"`
	Slug        string    `db:"slug" json:"slug"`
	Description *string   `db:"description" json:"description,omitempty"`
	IsSystem    bool      `db:"is_system" json:"isSystem"`
	CreatedBy   *string   `db:"created_by" json:"createdBy,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

type RolePermission struct {
	RoleID       string    `db:"role_id" json:"roleId"`
	PermissionID string    `db:"permission_id" json:"permissionId"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
}

type HotelRoleWithPermissions struct {
	HotelRole
	Permissions []Permission `json:"permissions"`
}
