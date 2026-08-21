package hotelwebsite

import (
	"context"
	"encoding/json"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelWebsiteRepo interface {
	Get(ctx context.Context, hotelID string) (model.HotelWebsite, error)
	Update(ctx context.Context, hotelID string, template, theme, fontPairing *string, content *model.SiteContent) (model.HotelWebsite, error)
}

type hotelWebsiteRepo struct {
	DB *pgxpool.Pool
}

func NewHotelWebsiteRepo(db *pgxpool.Pool) HotelWebsiteRepo {
	return &hotelWebsiteRepo{DB: db}
}

func scanHotelWebsite(row interface {
	Scan(dest ...any) error
}) (model.HotelWebsite, error) {
	var site model.HotelWebsite
	var contentJSON []byte

	if err := row.Scan(
		&site.HotelID,
		&site.Template,
		&site.Theme,
		&site.FontPairing,
		&contentJSON,
		&site.CreatedAt,
		&site.UpdatedAt,
	); err != nil {
		return model.HotelWebsite{}, err
	}

	if len(contentJSON) > 0 {
		if err := json.Unmarshal(contentJSON, &site.Content); err != nil {
			return model.HotelWebsite{}, err
		}
	}

	return site, nil
}

func (r *hotelWebsiteRepo) Get(ctx context.Context, hotelID string) (model.HotelWebsite, error) {
	query := `
		INSERT INTO hotel_websites (hotel_id)
		VALUES ($1::uuid)
		ON CONFLICT (hotel_id) DO UPDATE SET hotel_id = EXCLUDED.hotel_id
		RETURNING hotel_id, template, theme, font_pairing, content, created_at, updated_at
	`

	return scanHotelWebsite(r.DB.QueryRow(ctx, query, hotelID))
}

func (r *hotelWebsiteRepo) Update(ctx context.Context, hotelID string, template, theme, fontPairing *string, content *model.SiteContent) (model.HotelWebsite, error) {
	var contentJSON []byte
	if content != nil {
		marshaled, err := json.Marshal(content)
		if err != nil {
			return model.HotelWebsite{}, err
		}
		contentJSON = marshaled
	}

	query := `
		INSERT INTO hotel_websites (hotel_id, template, theme, font_pairing, content)
		VALUES (
			$1::uuid,
			COALESCE($2::text, 'aurora'),
			COALESCE($3::text, 'midnight-gold'),
			COALESCE($4::text, 'fraunces-public'),
			COALESCE($5::jsonb, '{}'::jsonb)
		)
		ON CONFLICT (hotel_id) DO UPDATE SET
			template = COALESCE($2::text, hotel_websites.template),
			theme = COALESCE($3::text, hotel_websites.theme),
			font_pairing = COALESCE($4::text, hotel_websites.font_pairing),
			content = COALESCE($5::jsonb, hotel_websites.content),
			updated_at = now()
		RETURNING hotel_id, template, theme, font_pairing, content, created_at, updated_at
	`

	return scanHotelWebsite(r.DB.QueryRow(ctx, query, hotelID, template, theme, fontPairing, contentJSON))
}
