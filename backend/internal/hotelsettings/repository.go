package hotelsettings

import (
	"context"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelSettingsRepo interface {
	Get(ctx context.Context, hotelID string) (model.HotelSettings, error)
	Update(ctx context.Context, hotelID string, currency *string, taxPercent, serviceChargePercent *float64, mapURL, aboutUs *string, amenities []string, openingTime, closingTime *string, openDays []string) (model.HotelSettings, error)
}

type hotelSettingsRepo struct {
	DB *pgxpool.Pool
}

func NewHotelSettingsRepo(db *pgxpool.Pool) HotelSettingsRepo {
	return &hotelSettingsRepo{DB: db}
}

func (r *hotelSettingsRepo) Get(ctx context.Context, hotelID string) (model.HotelSettings, error) {
	query := `
		INSERT INTO hotel_settings (hotel_id)
		VALUES ($1::uuid)
		ON CONFLICT (hotel_id) DO UPDATE SET hotel_id = EXCLUDED.hotel_id
		RETURNING hotel_id, currency, tax_percent, service_charge_percent, map_url, about_us, amenities, opening_time, closing_time, open_days, created_at, updated_at
	`

	var settings model.HotelSettings

	err := r.DB.QueryRow(ctx, query, hotelID).Scan(
		&settings.HotelID,
		&settings.Currency,
		&settings.TaxPercent,
		&settings.ServiceChargePercent,
		&settings.MapURL,
		&settings.AboutUs,
		&settings.Amenities,
		&settings.OpeningTime,
		&settings.ClosingTime,
		&settings.OpenDays,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)
	if err != nil {
		return model.HotelSettings{}, err
	}

	return settings, nil
}

func (r *hotelSettingsRepo) Update(ctx context.Context, hotelID string, currency *string, taxPercent, serviceChargePercent *float64, mapURL, aboutUs *string, amenities []string, openingTime, closingTime *string, openDays []string) (model.HotelSettings, error) {
	query := `
		INSERT INTO hotel_settings (hotel_id, currency, tax_percent, service_charge_percent, map_url, about_us, amenities, opening_time, closing_time, open_days)
		VALUES (
			$1::uuid, COALESCE($2::text, 'NPR'), COALESCE($3::numeric, 0), COALESCE($4::numeric, 0), $5::text, $6::text, COALESCE($7::text[], '{}'),
			$8::text, $9::text, COALESCE($10::text[], '{"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}')
		)
		ON CONFLICT (hotel_id) DO UPDATE SET
			currency = COALESCE($2::text, hotel_settings.currency),
			tax_percent = COALESCE($3::numeric, hotel_settings.tax_percent),
			service_charge_percent = COALESCE($4::numeric, hotel_settings.service_charge_percent),
			map_url = COALESCE($5::text, hotel_settings.map_url),
			about_us = COALESCE($6::text, hotel_settings.about_us),
			amenities = COALESCE($7::text[], hotel_settings.amenities),
			opening_time = COALESCE($8::text, hotel_settings.opening_time),
			closing_time = COALESCE($9::text, hotel_settings.closing_time),
			open_days = COALESCE($10::text[], hotel_settings.open_days),
			updated_at = now()
		RETURNING hotel_id, currency, tax_percent, service_charge_percent, map_url, about_us, amenities, opening_time, closing_time, open_days, created_at, updated_at
	`

	var settings model.HotelSettings

	err := r.DB.QueryRow(ctx, query, hotelID, currency, taxPercent, serviceChargePercent, mapURL, aboutUs, amenities, openingTime, closingTime, openDays).Scan(
		&settings.HotelID,
		&settings.Currency,
		&settings.TaxPercent,
		&settings.ServiceChargePercent,
		&settings.MapURL,
		&settings.AboutUs,
		&settings.Amenities,
		&settings.OpeningTime,
		&settings.ClosingTime,
		&settings.OpenDays,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)
	if err != nil {
		return model.HotelSettings{}, err
	}

	return settings, nil
}
