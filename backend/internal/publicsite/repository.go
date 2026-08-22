package publicsite

import (
	"context"
	"encoding/json"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PublicSiteRepo interface {
	GetHotelBySlug(ctx context.Context, slug string) (model.Hotel, error)
	GetWebsite(ctx context.Context, hotelID string) (model.HotelWebsite, error)
	ListRoomTypes(ctx context.Context, hotelID string) ([]model.RoomType, error)
	ListCabins(ctx context.Context, hotelID string) ([]model.Cabin, error)
	ListTables(ctx context.Context, hotelID string) ([]model.Table, error)
	ListMenuItems(ctx context.Context, hotelID string) ([]model.MenuItem, error)
	ListGalleryImages(ctx context.Context, hotelID string) ([]model.GalleryImage, error)
	GetSettings(ctx context.Context, hotelID string) (currency string, mapURL *string, err error)
}

type publicSiteRepo struct {
	DB *pgxpool.Pool
}

func NewPublicSiteRepo(db *pgxpool.Pool) PublicSiteRepo {
	return &publicSiteRepo{DB: db}
}

func (r *publicSiteRepo) GetHotelBySlug(ctx context.Context, slug string) (model.Hotel, error) {
	query := `
		SELECT id, name, slug, description, logo_url, address, city, phone_number, email, is_active, created_by, created_at, updated_at
		FROM hotels
		WHERE slug = $1::text AND is_active = true
	`

	var hotel model.Hotel

	err := r.DB.QueryRow(ctx, query, slug).Scan(
		&hotel.ID, &hotel.Name, &hotel.Slug, &hotel.Description, &hotel.LogoURL,
		&hotel.Address, &hotel.City, &hotel.PhoneNumber, &hotel.Email, &hotel.IsActive,
		&hotel.CreatedBy, &hotel.CreatedAt, &hotel.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return model.Hotel{}, apperr.ErrHotelNotFound
		}
		return model.Hotel{}, err
	}

	return hotel, nil
}

func (r *publicSiteRepo) GetWebsite(ctx context.Context, hotelID string) (model.HotelWebsite, error) {
	query := `
		SELECT hotel_id, template, theme, font_pairing, content, created_at, updated_at
		FROM hotel_websites
		WHERE hotel_id = $1::uuid
	`

	var site model.HotelWebsite
	var contentJSON []byte

	err := r.DB.QueryRow(ctx, query, hotelID).Scan(
		&site.HotelID, &site.Template, &site.Theme, &site.FontPairing, &contentJSON,
		&site.CreatedAt, &site.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return model.HotelWebsite{HotelID: hotelID, Template: "stonehouse", Theme: "tripto-blue", FontPairing: "tripto-roboto-inter"}, nil
		}
		return model.HotelWebsite{}, err
	}

	if err := json.Unmarshal(contentJSON, &site.Content); err != nil {
		return model.HotelWebsite{}, err
	}

	return site, nil
}

func (r *publicSiteRepo) ListRoomTypes(ctx context.Context, hotelID string) ([]model.RoomType, error) {
	query := `
		SELECT id, hotel_id, name, base_price, billing_type_id, pricing_label, capacity, description, amenities, restrictions, images, is_top_pick, created_at, updated_at
		FROM room_types
		WHERE hotel_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT 50
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.RoomType, 0)
	for rows.Next() {
		var rt model.RoomType
		if err := rows.Scan(
			&rt.ID, &rt.HotelID, &rt.Name, &rt.BasePrice, &rt.BillingTypeID, &rt.PricingLabel,
			&rt.Capacity, &rt.Description, &rt.Amenities, &rt.Restrictions, &rt.Images, &rt.IsTopPick,
			&rt.CreatedAt, &rt.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, rt)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) ListCabins(ctx context.Context, hotelID string) ([]model.Cabin, error) {
	query := `
		SELECT id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status, images, created_at, updated_at
		FROM cabins
		WHERE hotel_id = $1::uuid
		ORDER BY number
		LIMIT 50
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Cabin, 0)
	for rows.Next() {
		var c model.Cabin
		if err := rows.Scan(
			&c.ID, &c.HotelID, &c.Name, &c.Number, &c.BasePrice, &c.BillingTypeID, &c.Capacity,
			&c.Description, &c.Amenities, &c.Restrictions, &c.Status, &c.Images,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, c)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) ListTables(ctx context.Context, hotelID string) ([]model.Table, error) {
	query := `
		SELECT id, hotel_id, name, capacity, section_id, status, images, created_at, updated_at
		FROM dining_tables
		WHERE hotel_id = $1::uuid
		ORDER BY name
		LIMIT 50
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Table, 0)
	for rows.Next() {
		var t model.Table
		if err := rows.Scan(
			&t.ID, &t.HotelID, &t.Name, &t.Capacity, &t.SectionID, &t.Status, &t.Images,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, t)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) ListMenuItems(ctx context.Context, hotelID string) ([]model.MenuItem, error) {
	query := `
		SELECT mi.id, mi.hotel_id, mi.dish_id, d.name, d.image_url, mi.category_id, c.name, mi.food_type,
		       mi.price, mi.discount, mi.description, mi.ingredients, mi.available, mi.is_top_pick,
		       mi.created_at, mi.updated_at
		FROM menu_items mi
		JOIN dishes d ON d.id = mi.dish_id
		JOIN categories c ON c.id = mi.category_id
		WHERE mi.hotel_id = $1::uuid AND mi.available = true
		ORDER BY d.name
		LIMIT 200
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.MenuItem, 0)
	for rows.Next() {
		var item model.MenuItem
		if err := rows.Scan(
			&item.ID, &item.HotelID, &item.DishID, &item.Name, &item.ImageURL, &item.CategoryID,
			&item.CategoryName, &item.FoodType, &item.Price, &item.Discount, &item.Description,
			&item.Ingredients, &item.Available, &item.IsTopPick, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		item.AddOns = []model.AddOnRef{}
		list = append(list, item)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) ListGalleryImages(ctx context.Context, hotelID string) ([]model.GalleryImage, error) {
	query := `
		SELECT id, hotel_id, url, section, position, created_at
		FROM hotel_gallery_images
		WHERE hotel_id = $1::uuid
		ORDER BY position, created_at
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.GalleryImage, 0)
	for rows.Next() {
		var img model.GalleryImage
		if err := rows.Scan(&img.ID, &img.HotelID, &img.URL, &img.Section, &img.Position, &img.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, img)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) GetSettings(ctx context.Context, hotelID string) (string, *string, error) {
	query := `SELECT currency, map_url FROM hotel_settings WHERE hotel_id = $1::uuid`

	var currency string
	var mapURL *string

	err := r.DB.QueryRow(ctx, query, hotelID).Scan(&currency, &mapURL)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "NPR", nil, nil
		}
		return "", nil, err
	}

	return currency, mapURL, nil
}
