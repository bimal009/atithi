package member

import model "github.com/bimal009/atithi/internal/models"

type AddMemberRequest struct {
	Phone  string `json:"phone" validate:"required,nepaliphone"`
	RoleID string `json:"roleId" validate:"required,uuid"`
}

type ListMembersResponse struct {
	Members []model.MemberDetail `json:"members"`
	Page    int                  `json:"page"`
	Limit   int                  `json:"limit"`
	Total   int                  `json:"total"`
}
