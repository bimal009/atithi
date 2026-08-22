package publicsite

import model "github.com/bimal009/atithi/internal/models"

type SiteResponse struct {
	Hotel         model.Hotel         `json:"hotel"`
	Website       model.HotelWebsite  `json:"website"`
	RoomTypes     []model.RoomType    `json:"roomTypes"`
	Cabins        []model.Cabin       `json:"cabins"`
	Tables        []model.Table       `json:"tables"`
	MenuItems     []model.MenuItem    `json:"menuItems"`
	GalleryImages []model.GalleryImage `json:"galleryImages"`
	Currency      string              `json:"currency"`
	MapURL        *string             `json:"mapUrl,omitempty"`
}
