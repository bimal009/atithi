package account

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
