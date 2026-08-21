package hotelwebsite

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
)

type HotelWebsiteService interface {
	Get(ctx context.Context, hotelID string) (model.HotelWebsite, error)
	Update(ctx context.Context, hotelID string, req *UpdateHotelWebsiteRequest) (model.HotelWebsite, error)
}

type hotelWebsiteService struct {
	slog *slog.Logger
	repo HotelWebsiteRepo
}

func NewHotelWebsiteService(slog *slog.Logger, repo HotelWebsiteRepo) HotelWebsiteService {
	return &hotelWebsiteService{slog: slog, repo: repo}
}

func (s *hotelWebsiteService) Get(ctx context.Context, hotelID string) (model.HotelWebsite, error) {
	return s.repo.Get(ctx, hotelID)
}

func (s *hotelWebsiteService) Update(ctx context.Context, hotelID string, req *UpdateHotelWebsiteRequest) (model.HotelWebsite, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.HotelWebsite{}, err
	}

	updated, err := s.repo.Update(ctx, hotelID, req.Template, req.Theme, req.FontPairing, req.Content)
	if err != nil {
		s.slog.Error("failed to update hotel website", "hotel_id", hotelID, "error", err)
		return model.HotelWebsite{}, err
	}

	s.slog.Info("hotel website updated", "hotel_id", hotelID)

	return updated, nil
}
