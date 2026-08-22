package gallery

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
)

const maxGalleryImages = 60

type GalleryService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateGalleryImageRequest) (model.GalleryImage, error)
	GetAll(ctx context.Context, hotelID, userID string) (ListGalleryImagesResponse, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type galleryService struct {
	slog *slog.Logger
	repo GalleryRepo
}

func NewGalleryService(slog *slog.Logger, repo GalleryRepo) GalleryService {
	return &galleryService{slog: slog, repo: repo}
}

func (s *galleryService) Create(ctx context.Context, hotelID, userID string, req *CreateGalleryImageRequest) (model.GalleryImage, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.GalleryImage{}, err
	}

	existing, err := s.repo.ListForHotel(ctx, hotelID, userID)
	if err != nil {
		return model.GalleryImage{}, err
	}
	if len(existing) >= maxGalleryImages {
		return model.GalleryImage{}, apperr.ErrLimitExceeded
	}

	section := req.Section
	if section == "" {
		section = "General"
	}

	created, err := s.repo.Create(ctx, hotelID, req.URL, section, userID)
	if err != nil {
		s.slog.Error("failed to add gallery image", "hotel_id", hotelID, "error", err)
		return model.GalleryImage{}, err
	}

	s.slog.Info("gallery image added", "gallery_image_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *galleryService) GetAll(ctx context.Context, hotelID, userID string) (ListGalleryImagesResponse, error) {
	list, err := s.repo.ListForHotel(ctx, hotelID, userID)
	if err != nil {
		return ListGalleryImagesResponse{}, err
	}

	return ListGalleryImagesResponse{Images: list}, nil
}

func (s *galleryService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete gallery image", "gallery_image_id", id, "error", err)
		return err
	}

	s.slog.Info("gallery image deleted", "gallery_image_id", id)

	return nil
}
