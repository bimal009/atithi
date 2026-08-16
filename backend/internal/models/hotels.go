package model

import "time"

type Hotel struct {
	ID          string    `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Slug        string    `db:"slug" json:"slug"`
	Description *string   `db:"description" json:"description,omitempty"`
	LogoURL     *string   `db:"logo_url" json:"logoUrl,omitempty"`
	Address     string    `db:"address" json:"address"`
	City        *string   `db:"city" json:"city,omitempty"`
	PhoneNumber string    `db:"phone_number" json:"phoneNumber"`
	Email       *string   `db:"email" json:"email,omitempty"`
	IsActive    bool      `db:"is_active" json:"isActive"`
	CreatedBy   *string   `db:"created_by" json:"createdBy,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}
