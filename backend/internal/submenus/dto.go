package submenus

import model "github.com/bimal009/atithi/internal/models"

type CreateSubMenuRequest struct {
	Name        string  `json:"name" validate:"required,min=1,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
}

type UpdateSubMenuRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
}

type ListSubMenusResponse struct {
	SubMenus []model.SubMenu `json:"subMenus"`
}
