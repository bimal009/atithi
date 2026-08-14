package auth

import (
	"time"

	model "github.com/bimal009/atithi/internal/models"
)

type LoginRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required,nepaliphone"`
}

type CreateSessionRequest struct {
	UserID    string    `json:"userId" validate:"required"`
	Token     string    `json:"token" validate:"required,min=16"`
	ExpiresAt time.Time `json:"expiresAt" validate:"required"`
	IPAddress string    `json:"ipAddress,omitempty" validate:"omitempty,ip"`
	UserAgent string    `json:"userAgent,omitempty"`
}

type CreateCredentialAccountRequest struct {
	AccountID string `json:"accountId" validate:"required"`
	UserID    string `json:"userId" validate:"required"`
	Password  string `json:"password" validate:"required,min=60"`
}

type CreateOAuthAccountRequest struct {
	AccountID   string `json:"accountId" validate:"required"`
	ProviderID  string `json:"providerId" validate:"required,oneof=google github"`
	UserID      string `json:"userId" validate:"required"`
	AccessToken string `json:"accessToken,omitempty"`
	IDToken     string `json:"idToken,omitempty"`
}

type CreateVerificationRequest struct {
	Identifier string    `json:"identifier" validate:"required"`
	Value      string    `json:"value" validate:"required"`
	ExpiresAt  time.Time `json:"expiresAt" validate:"required"`
}
type ResendOtpRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required,nepaliphone"`
}

type ValidateOtpRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required,nepaliphone"`
	Otp         string `json:"otp" validate:"required,len=6,number"`
}

type SessionMeta struct {
	IPAddress string
	UserAgent string
}

type SessionResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	ExpiresAt time.Time `json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	IPAddress *string   `json:"ipAddress,omitempty"`
	UserAgent *string   `json:"userAgent,omitempty"`
}

func NewSessionResponse(s model.Session) SessionResponse {
	return SessionResponse{
		ID:        s.ID,
		UserID:    s.UserID,
		ExpiresAt: s.ExpiresAt,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
		IPAddress: s.IPAddress,
		UserAgent: s.UserAgent,
	}
}

type AuthResponse struct {
	User    model.User      `json:"user"`
	Session SessionResponse `json:"session"`
}
