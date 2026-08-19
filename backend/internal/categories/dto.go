package categories

import model "github.com/bimal009/atithi/internal/models"

type CreateCategoryRequest struct {
	Name       string   `json:"name" validate:"required,min=1,max=100"`
	SubMenuIDs []string `json:"subMenuIds" validate:"required,min=1,dive,uuid"`
}

type UpdateCategoryRequest struct {
	Name       *string  `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	SubMenuIDs []string `json:"subMenuIds,omitempty" validate:"omitempty,min=1,dive,uuid"`
}

type ListCategoriesResponse struct {
	Categories []model.Category `json:"categories"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	Total      int              `json:"total"`
}
