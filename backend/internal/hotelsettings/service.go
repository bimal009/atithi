package hotelsettings

import (
	"context"
	"log/slog"
	"strings"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
)

type HotelSettingsService interface {
	Get(ctx context.Context, hotelID string) (model.HotelSettings, error)
	Update(ctx context.Context, hotelID string, req *UpdateHotelSettingsRequest) (model.HotelSettings, error)
}

type hotelSettingsService struct {
	slog *slog.Logger
	repo HotelSettingsRepo
}

func NewHotelSettingsService(slog *slog.Logger, repo HotelSettingsRepo) HotelSettingsService {
	return &hotelSettingsService{slog: slog, repo: repo}
}

func (s *hotelSettingsService) Get(ctx context.Context, hotelID string) (model.HotelSettings, error) {
	return s.repo.Get(ctx, hotelID)
}

func (s *hotelSettingsService) Update(ctx context.Context, hotelID string, req *UpdateHotelSettingsRequest) (model.HotelSettings, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.HotelSettings{}, err
	}

	if req.Currency != nil {
		upper := strings.ToUpper(*req.Currency)
		req.Currency = &upper
	}

	updated, err := s.repo.Update(ctx, hotelID, UpdateParams{
		Currency:             req.Currency,
		TaxPercent:           req.TaxPercent,
		ServiceChargePercent: req.ServiceChargePercent,
		MapURL:               req.MapURL,
		AboutUs:              req.AboutUs,
		Amenities:            req.Amenities,
		OpeningTime:          req.OpeningTime,
		ClosingTime:          req.ClosingTime,
		OpenDays:             req.OpenDays,
		WhatsAppNumber:       req.WhatsAppNumber,
	})
	if err != nil {
		s.slog.Error("failed to update hotel settings", "hotel_id", hotelID, "error", err)
		return model.HotelSettings{}, err
	}

	s.slog.Info("hotel settings updated", "hotel_id", hotelID)

	return updated, nil
}
