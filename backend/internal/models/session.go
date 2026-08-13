package model

import "time"

type Session struct {
	ID        string    `db:"id" json:"id"`
	ExpiresAt time.Time `db:"expires_at" json:"expiresAt"`
	Token     string    `db:"token" json:"token"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
	IPAddress *string   `db:"ip_address" json:"ipAddress,omitempty"`
	UserAgent *string   `db:"user_agent" json:"userAgent,omitempty"`
	UserID    string    `db:"user_id" json:"userId"`
}
