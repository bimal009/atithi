package model

import (
	"time"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID            string    `db:"id" json:"id"`
	PhoneNumber   string    `db:"phone_number" json:"phoneNumber"`
	Name          string    `db:"name" json:"name"`
	Email         string    `db:"email" json:"email"`
	EmailVerified bool      `db:"email_verified" json:"emailVerified"`
	Image         *string   `db:"image" json:"image,omitempty"`
	IsOnboarded   bool      `db:"is_onboarded" json:"isOnboarded"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt     time.Time `db:"updated_at" json:"updatedAt"`
	Role          Role      `db:"role" json:"role"`
}
