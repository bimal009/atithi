package categories

import model "github.com/bimal009/atithi/internal/models"

type CreateCategoryRequest struct {
	Name      string `json:"name" validate:"required,min=1,max=100"`
	SubMenuID string `json:"subMenuId" validate:"required,uuid"`
}

type UpdateCategoryRequest struct {
	Name      *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	SubMenuID *string `json:"subMenuId,omitempty" validate:"omitempty,uuid"`
}

type ListCategoriesResponse struct {
	Categories []model.Category `json:"categories"`
}
