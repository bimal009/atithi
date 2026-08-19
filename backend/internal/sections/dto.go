package sections

import model "github.com/bimal009/atithi/internal/models"

type CreateSectionRequest struct {
	Name string `json:"name" validate:"required,min=1,max=100"`
}

type UpdateSectionRequest struct {
	Name *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
}

type ListSectionsResponse struct {
	Sections []model.Section `json:"sections"`
	Page     int             `json:"page"`
	Limit    int             `json:"limit"`
	Total    int             `json:"total"`
}
