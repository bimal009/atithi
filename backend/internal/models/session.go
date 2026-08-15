package model

import "time"

type Session struct {
	ID                string    `db:"id" json:"id"`
	ExpiresAt         time.Time `db:"expires_at" json:"expiresAt"`
	AbsoluteExpiresAt time.Time `db:"absolute_expires_at" json:"absoluteExpiresAt"`
	TokenHash         string    `db:"token_hash" json:"-"`
	CreatedAt         time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt         time.Time `db:"updated_at" json:"updatedAt"`
	IPAddress         *string   `db:"ip_address" json:"ipAddress,omitempty"`
	UserAgent         *string   `db:"user_agent" json:"userAgent,omitempty"`
	UserID            string    `db:"user_id" json:"userId"`
}
