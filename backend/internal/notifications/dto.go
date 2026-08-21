package notifications

import model "github.com/bimal009/atithi/internal/models"

type CreateNotificationRequest struct {
	Type     string  `json:"type" validate:"required,min=1,max=100"`
	Title    string  `json:"title" validate:"required,min=1,max=200"`
	Subtitle *string `json:"subtitle,omitempty" validate:"omitempty,max=200"`
}

type ListNotificationsResponse struct {
	Notifications []model.Notification `json:"notifications"`
	Page          int                  `json:"page"`
	Limit         int                  `json:"limit"`
	Total         int                  `json:"total"`
}

type ListNotificationsQuery struct {
	model.Pagination
	Read *bool `form:"read" json:"read"`
}
