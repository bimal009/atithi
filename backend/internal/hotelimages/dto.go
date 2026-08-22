package hotelimages

import model "github.com/bimal009/atithi/internal/models"

var ValidEntityTypes = map[string]bool{
	"logo":    true,
	"cabin":   true,
	"room":    true,
	"table":   true,
	"gallery": true,
}

type CreateHotelImageRequest struct {
	EntityType string  `json:"entityType" validate:"required,oneof=logo cabin room table gallery"`
	EntityID   *string `json:"entityId,omitempty" validate:"omitempty,uuid"`
	URL        string  `json:"url" validate:"required,url"`
	FileID     *string `json:"fileId,omitempty"`
	FileSize   *int    `json:"fileSize,omitempty"`
	Section    *string `json:"section,omitempty" validate:"omitempty,max=60"`
}

type ListHotelImagesResponse struct {
	Images []model.HotelImage `json:"images"`
}
