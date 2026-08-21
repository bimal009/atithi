package hotelwebsite

import model "github.com/bimal009/atithi/internal/models"

type UpdateHotelWebsiteRequest struct {
	Template    *string            `json:"template,omitempty" validate:"omitempty,oneof=aurora verdant onyx citrus resort"`
	Theme       *string            `json:"theme,omitempty" validate:"omitempty,min=1,max=50"`
	FontPairing *string            `json:"fontPairing,omitempty" validate:"omitempty,min=1,max=50"`
	Content     *model.SiteContent `json:"content,omitempty"`
}
