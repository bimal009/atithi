package gallery

import model "github.com/bimal009/atithi/internal/models"

type CreateGalleryImageRequest struct {
	URL string `json:"url" validate:"required,url"`
}

type ListGalleryImagesResponse struct {
	Images []model.GalleryImage `json:"images"`
}
