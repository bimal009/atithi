package billingtypes

import model "github.com/bimal009/atithi/internal/models"

type CreateBillingTypeRequest struct {
	Name string `json:"name" validate:"required,min=1,max=100"`
}

type UpdateBillingTypeRequest struct {
	Name *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
}

type ListBillingTypesResponse struct {
	BillingTypes []model.BillingType `json:"billingTypes"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
	Total        int                 `json:"total"`
}
