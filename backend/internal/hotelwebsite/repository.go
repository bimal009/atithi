package hotelwebsite

import (
	"context"
	"encoding/json"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelWebsiteRepo interface {
	Create(ctx context.Context, hotelID string) (model.HotelWebsite, error)
	Get(ctx context.Context, hotelID string) (model.HotelWebsite, error)
	Update(ctx context.Context, hotelID string, template, theme, fontPairing *string, content *model.SiteContent) (model.HotelWebsite, error)
}

type hotelWebsiteRepo struct {
	DB *pgxpool.Pool
}

func NewHotelWebsiteRepo(db *pgxpool.Pool) HotelWebsiteRepo {
	return &hotelWebsiteRepo{DB: db}
}

func (r *hotelWebsiteRepo) Create(ctx context.Context, hotelID string) (model.HotelWebsite, error) {
	query := `
		INSERT INTO hotel_websites (hotel_id)
		VALUES ($1::uuid)
		RETURNING hotel_id, template, theme, font_pairing, content, created_at, updated_at
	`

	var site model.HotelWebsite
	var contentJSON []byte

	if err := r.DB.QueryRow(ctx, query, hotelID).Scan(
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
		SELECT hotel_id, template, theme, font_pairing, content, created_at, updated_at
		FROM hotel_websites
		WHERE hotel_id = $1::uuid
	`

	var site model.HotelWebsite
	var contentJSON []byte

	if err := r.DB.QueryRow(ctx, query, hotelID).Scan(
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

func (r *hotelWebsiteRepo) Update(ctx context.Context, hotelID string, template, theme, fontPairing *string, content *model.SiteContent) (model.HotelWebsite, error) {
	var contentJSON *string
	if content != nil {
		marshaled, err := json.Marshal(content)
		if err != nil {
			return model.HotelWebsite{}, err
		}
		s := string(marshaled)
		contentJSON = &s
	}

	query := `
		UPDATE hotel_websites SET
			template = COALESCE($2::text, template),
			theme = COALESCE($3::text, theme),
			font_pairing = COALESCE($4::text, font_pairing),
			content = COALESCE($5::text::jsonb, content),
			updated_at = now()
		WHERE hotel_id = $1::uuid
		RETURNING hotel_id, template, theme, font_pairing, content, created_at, updated_at
	`

	var site model.HotelWebsite
	var contentJSON2 []byte

	if err := r.DB.QueryRow(ctx, query, hotelID, template, theme, fontPairing, contentJSON).Scan(
		&site.HotelID,
		&site.Template,
		&site.Theme,
		&site.FontPairing,
		&contentJSON2,
		&site.CreatedAt,
		&site.UpdatedAt,
	); err != nil {
		return model.HotelWebsite{}, err
	}

	if len(contentJSON2) > 0 {
		if err := json.Unmarshal(contentJSON2, &site.Content); err != nil {
			return model.HotelWebsite{}, err
		}
	}

	return site, nil
}
