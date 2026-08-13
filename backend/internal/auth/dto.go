package auth

import "time"

// LoginRequest starts the phone-OTP flow. The same call signs up a new phone
// number and logs in an existing one.
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
