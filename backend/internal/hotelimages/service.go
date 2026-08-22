package hotelimages

import (
	"context"
	"log/slog"

	"github.com/bimal009/atithi/config"
	imagekit "github.com/bimal009/atithi/internal/imagekit"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
)

var maxPerEntityType = map[string]int{
	"cabin":   3,
	"room":    5,
	"table":   3,
	"gallery": 30,
}

type HotelImageService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateHotelImageRequest) (model.HotelImage, error)
	List(ctx context.Context, hotelID, userID, entityType string, entityID *string) (ListHotelImagesResponse, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type hotelImageService struct {
	slog *slog.Logger
	repo HotelImageRepo
	cfg  *config.Config
}

func NewHotelImageService(slog *slog.Logger, repo HotelImageRepo, cfg *config.Config) HotelImageService {
	return &hotelImageService{slog: slog, repo: repo, cfg: cfg}
}

func (s *hotelImageService) Create(ctx context.Context, hotelID, userID string, req *CreateHotelImageRequest) (model.HotelImage, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.HotelImage{}, err
	}
	if !ValidEntityTypes[req.EntityType] {
		return model.HotelImage{}, apperr.ErrInvalidEntityType
	}

	if req.EntityType == "logo" {
		// Logo is a singleton — uploading a new one replaces the old.
		existing, err := s.repo.ListForHotel(ctx, hotelID, userID, "logo", nil)
		if err != nil {
			return model.HotelImage{}, err
		}
		for _, old := range existing {
			if err := s.Delete(ctx, old.ID, hotelID, userID); err != nil {
				s.slog.Error("failed to replace old logo", "hotel_id", hotelID, "error", err)
			}
		}
	} else if limit, ok := maxPerEntityType[req.EntityType]; ok {
		count, err := s.repo.CountForEntity(ctx, hotelID, req.EntityType, req.EntityID)
		if err != nil {
			return model.HotelImage{}, err
		}
		if count >= limit {
			return model.HotelImage{}, apperr.ErrLimitExceeded
		}
	}

	img := &model.HotelImage{
		HotelID:    hotelID,
		EntityType: req.EntityType,
		EntityID:   req.EntityID,
		URL:        req.URL,
		FileID:     req.FileID,
		FileSize:   req.FileSize,
		Section:    req.Section,
	}

	created, err := s.repo.Create(ctx, img, userID)
	if err != nil {
		s.slog.Error("failed to add hotel image", "hotel_id", hotelID, "entity_type", req.EntityType, "error", err)
		return model.HotelImage{}, err
	}

	s.slog.Info("hotel image added", "image_id", created.ID, "hotel_id", hotelID, "entity_type", created.EntityType)

	return created, nil
}

func (s *hotelImageService) List(ctx context.Context, hotelID, userID, entityType string, entityID *string) (ListHotelImagesResponse, error) {
	if !ValidEntityTypes[entityType] {
		return ListHotelImagesResponse{}, apperr.ErrInvalidEntityType
	}

	list, err := s.repo.ListForHotel(ctx, hotelID, userID, entityType, entityID)
	if err != nil {
		return ListHotelImagesResponse{}, err
	}

	return ListHotelImagesResponse{Images: list}, nil
}

func (s *hotelImageService) Delete(ctx context.Context, id, hotelID, userID string) error {
	deleted, err := s.repo.Delete(ctx, id, hotelID, userID)
	if err != nil {
		s.slog.Error("failed to delete hotel image", "image_id", id, "error", err)
		return err
	}

	if deleted.FileID != nil {
		if err := imagekit.DeleteFile(ctx, s.cfg, *deleted.FileID); err != nil {
			s.slog.Error("failed to delete image from ImageKit", "image_id", id, "file_id", *deleted.FileID, "error", err)
		}
	}

	s.slog.Info("hotel image deleted", "image_id", id)

	return nil
}
