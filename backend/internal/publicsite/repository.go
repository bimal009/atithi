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
	ListTestimonials(ctx context.Context, hotelID string) ([]model.Testimonial, error)
	ListSections(ctx context.Context, hotelID string) ([]model.Section, error)
	GetSettings(ctx context.Context, hotelID string) (currency string, mapURL, aboutUs *string, amenities []string, err error)
}

type publicSiteRepo struct {
	DB *pgxpool.Pool
}

func NewPublicSiteRepo(db *pgxpool.Pool) PublicSiteRepo {
	return &publicSiteRepo{DB: db}
}

func (r *publicSiteRepo) GetHotelBySlug(ctx context.Context, slug string) (model.Hotel, error) {
	query := `
		SELECT id, name, slug, description, address, city, phone_number, email, is_active, created_by, created_at, updated_at
		FROM hotels
		WHERE slug = $1::text AND is_active = true
	`

	var hotel model.Hotel

	err := r.DB.QueryRow(ctx, query, slug).Scan(
		&hotel.ID, &hotel.Name, &hotel.Slug, &hotel.Description,
		&hotel.Address, &hotel.City, &hotel.PhoneNumber, &hotel.Email, &hotel.IsActive,
		&hotel.CreatedBy, &hotel.CreatedAt, &hotel.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return model.Hotel{}, apperr.ErrHotelNotFound
		}
		return model.Hotel{}, err
	}

	var logoURL string
	err = r.DB.QueryRow(ctx, `
		SELECT url FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = 'logo'
		ORDER BY created_at DESC
		LIMIT 1
	`, hotel.ID).Scan(&logoURL)
	if err == nil {
		hotel.LogoURL = &logoURL
	} else if err != pgx.ErrNoRows {
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
			return model.HotelWebsite{HotelID: hotelID, Template: "editorial", Theme: "amber", FontPairing: "fraunces-public"}, nil
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
		SELECT id, hotel_id, name, base_price, billing_type_id, pricing_label, capacity, description, amenities, restrictions, is_top_pick, created_at, updated_at
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
			&rt.Capacity, &rt.Description, &rt.Amenities, &rt.Restrictions, &rt.IsTopPick,
			&rt.CreatedAt, &rt.UpdatedAt,
		); err != nil {
			return nil, err
		}
		rt.Images = []string{}
		list = append(list, rt)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	imgRows, err := r.DB.Query(ctx, `
		SELECT ro.room_type_id, hi.url
		FROM rooms ro
		JOIN hotel_images hi ON hi.entity_type = 'room' AND hi.entity_id = ro.id
		WHERE ro.hotel_id = $1::uuid
		ORDER BY hi.position, hi.created_at
	`, hotelID)
	if err != nil {
		return nil, err
	}
	defer imgRows.Close()

	byRoomType := map[string][]string{}
	for imgRows.Next() {
		var roomTypeID, url string
		if err := imgRows.Scan(&roomTypeID, &url); err != nil {
			return nil, err
		}
		byRoomType[roomTypeID] = append(byRoomType[roomTypeID], url)
	}
	if err := imgRows.Err(); err != nil {
		return nil, err
	}

	for i := range list {
		if imgs, ok := byRoomType[list[i].ID]; ok {
			list[i].Images = imgs
		}
	}

	return list, nil
}

func (r *publicSiteRepo) ListCabins(ctx context.Context, hotelID string) ([]model.Cabin, error) {
	query := `
		SELECT id, hotel_id, name, number, base_price, billing_type_id, capacity, description, amenities, restrictions, status, created_at, updated_at
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
			&c.Description, &c.Amenities, &c.Restrictions, &c.Status,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		c.Images = []string{}
		list = append(list, c)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	imagesByCabin, err := r.imagesByEntity(ctx, hotelID, "cabin")
	if err != nil {
		return nil, err
	}
	for i := range list {
		if imgs, ok := imagesByCabin[list[i].ID]; ok {
			list[i].Images = imgs
		}
	}

	return list, nil
}

func (r *publicSiteRepo) ListTables(ctx context.Context, hotelID string) ([]model.Table, error) {
	query := `
		SELECT id, hotel_id, name, capacity, section_id, status, created_at, updated_at
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
			&t.ID, &t.HotelID, &t.Name, &t.Capacity, &t.SectionID, &t.Status,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		t.Images = []string{}
		list = append(list, t)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	imagesByTable, err := r.imagesByEntity(ctx, hotelID, "table")
	if err != nil {
		return nil, err
	}
	for i := range list {
		if imgs, ok := imagesByTable[list[i].ID]; ok {
			list[i].Images = imgs
		}
	}

	return list, nil
}

func (r *publicSiteRepo) imagesByEntity(ctx context.Context, hotelID, entityType string) (map[string][]string, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT entity_id, url FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = $2
		ORDER BY position, created_at
	`, hotelID, entityType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byEntity := map[string][]string{}
	for rows.Next() {
		var entityID *string
		var url string
		if err := rows.Scan(&entityID, &url); err != nil {
			return nil, err
		}
		if entityID == nil {
			continue
		}
		byEntity[*entityID] = append(byEntity[*entityID], url)
	}
	return byEntity, rows.Err()
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
		SELECT id, hotel_id, url, file_id, COALESCE(section, ''), position, created_at
		FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = 'gallery'
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
		if err := rows.Scan(&img.ID, &img.HotelID, &img.URL, &img.FileID, &img.Section, &img.Position, &img.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, img)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) ListTestimonials(ctx context.Context, hotelID string) ([]model.Testimonial, error) {
	query := `
		SELECT id, hotel_id, guest_name, stay_label, quote, rating, created_at, updated_at
		FROM testimonials
		WHERE hotel_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT 20
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Testimonial, 0)
	for rows.Next() {
		var t model.Testimonial
		if err := rows.Scan(
			&t.ID, &t.HotelID, &t.GuestName, &t.StayLabel, &t.Quote, &t.Rating, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, t)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) ListSections(ctx context.Context, hotelID string) ([]model.Section, error) {
	query := `
		SELECT id, hotel_id, name, created_at, updated_at
		FROM sections
		WHERE hotel_id = $1::uuid
		ORDER BY name
	`

	rows, err := r.DB.Query(ctx, query, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Section, 0)
	for rows.Next() {
		var s model.Section
		if err := rows.Scan(&s.ID, &s.HotelID, &s.Name, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}

	return list, rows.Err()
}

func (r *publicSiteRepo) GetSettings(ctx context.Context, hotelID string) (string, *string, *string, []string, error) {
	query := `SELECT currency, map_url, about_us, amenities FROM hotel_settings WHERE hotel_id = $1::uuid`

	var currency string
	var mapURL, aboutUs *string
	var amenities []string

	err := r.DB.QueryRow(ctx, query, hotelID).Scan(&currency, &mapURL, &aboutUs, &amenities)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "NPR", nil, nil, []string{}, nil
		}
		return "", nil, nil, nil, err
	}

	return currency, mapURL, aboutUs, amenities, nil
}
