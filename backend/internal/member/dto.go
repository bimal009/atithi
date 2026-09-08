package member

import model "github.com/bimal009/atithi/internal/models"

type AddMemberRequest struct {
	Email  string `json:"email" validate:"required,email"`
	RoleID string `json:"roleId" validate:"required,uuid"`
}

type UpdateMemberRequest struct {
	RoleID *string `json:"roleId,omitempty" validate:"omitempty,uuid"`
	Status *string `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

type ListMembersQuery struct {
	RoleID string `form:"roleId" validate:"omitempty,uuid"`
}

type ListMembersResponse struct {
	Members []model.MemberDetail `json:"members"`
	Page    int                  `json:"page"`
	Limit   int                  `json:"limit"`
	Total   int                  `json:"total"`
}
