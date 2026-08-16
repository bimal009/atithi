package customer

import model "github.com/bimal009/atithi/internal/models"

const (
	DocumentTypeCitizenship    = "citizenship"
	DocumentTypePassport       = "passport"
	DocumentTypeDrivingLicense = "driving_license"
	DocumentTypeVoterID        = "voter_id"
	DocumentTypeNationalID     = "national_id"
)

type CreateCustomerRequest struct {
	Name           string  `json:"name" validate:"required,min=2,max=255"`
	Phone          string  `json:"phone" validate:"required,min=7,max=20"`
	Email          *string `json:"email,omitempty" validate:"omitempty,email"`
	Notes          *string `json:"notes,omitempty" validate:"omitempty,max=2000"`
	DocumentType   *string `json:"documentType,omitempty" validate:"omitempty,oneof=citizenship passport driving_license voter_id national_id"`
	DocumentNumber *string `json:"documentNumber,omitempty" validate:"omitempty,max=100"`
}

type UpdateCustomerRequest struct {
	Name           *string `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	Phone          *string `json:"phone,omitempty" validate:"omitempty,min=7,max=20"`
	Email          *string `json:"email,omitempty" validate:"omitempty,email"`
	Notes          *string `json:"notes,omitempty" validate:"omitempty,max=2000"`
	DocumentType   *string `json:"documentType,omitempty" validate:"omitempty,oneof=citizenship passport driving_license voter_id national_id"`
	DocumentNumber *string `json:"documentNumber,omitempty" validate:"omitempty,max=100"`
}

type ListCustomersResponse struct {
	Customers []model.Customer `json:"customers"`
	Page      int              `json:"page"`
	Limit     int              `json:"limit"`
	Total     int              `json:"total"`
}
