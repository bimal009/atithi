package publicsite

import model "github.com/bimal009/atithi/internal/models"

type SiteResponse struct {
	Hotel          model.Hotel          `json:"hotel"`
	Website        model.HotelWebsite   `json:"website"`
	RoomTypes      []model.RoomType     `json:"roomTypes"`
	Cabins         []model.Cabin        `json:"cabins"`
	Tables         []model.Table        `json:"tables"`
	MenuItems      []model.MenuItem     `json:"menuItems"`
	GalleryImages  []model.GalleryImage `json:"galleryImages"`
	Testimonials   []model.Testimonial  `json:"testimonials"`
	Sections       []model.Section      `json:"sections"`
	Currency       string               `json:"currency"`
	MapURL         *string              `json:"mapUrl,omitempty"`
	AboutUs        *string              `json:"aboutUs,omitempty"`
	Amenities      []string             `json:"amenities"`
	OpeningTime    *string              `json:"openingTime,omitempty"`
	ClosingTime    *string              `json:"closingTime,omitempty"`
	OpenDays       []string             `json:"openDays"`
	WhatsAppNumber *string              `json:"whatsappNumber,omitempty"`
}
