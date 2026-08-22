package gallery

import model "github.com/bimal009/atithi/internal/models"

type CreateGalleryImageRequest struct {
	URL     string `json:"url" validate:"required,url"`
	Section string `json:"section,omitempty" validate:"omitempty,max=60"`
}

type ListGalleryImagesResponse struct {
	Images []model.GalleryImage `json:"images"`
}
