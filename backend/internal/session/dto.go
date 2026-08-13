package session

import "time"

type CreateSessionRequest struct {
	UserID    string    `json:"userId" validate:"required"`
	Token     string    `json:"token" validate:"required,min=16"`
	ExpiresAt time.Time `json:"expiresAt" validate:"required"`
	IPAddress string    `json:"ipAddress,omitempty" validate:"omitempty,ip"`
	UserAgent string    `json:"userAgent,omitempty"`
}
