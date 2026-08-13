package model

import "time"

type Account struct {
	ID                    string     `db:"id" json:"id"`
	AccountID             string     `db:"account_id" json:"accountId"`
	ProviderID            string     `db:"provider_id" json:"providerId"`
	UserID                string     `db:"user_id" json:"userId"`
	AccessToken           *string    `db:"access_token" json:"-"`
	RefreshToken          *string    `db:"refresh_token" json:"-"`
	IDToken               *string    `db:"id_token" json:"-"`
	AccessTokenExpiresAt  *time.Time `db:"access_token_expires_at" json:"accessTokenExpiresAt,omitempty"`
	RefreshTokenExpiresAt *time.Time `db:"refresh_token_expires_at" json:"refreshTokenExpiresAt,omitempty"`
	Scope                 *string    `db:"scope" json:"scope,omitempty"`
	Password              *string    `db:"password" json:"-"`
	CreatedAt             time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt             time.Time  `db:"updated_at" json:"updatedAt"`
}
