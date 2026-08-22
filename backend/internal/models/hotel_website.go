package model

import "time"

type SiteContent struct {
	HeroEyebrow         string          `json:"heroEyebrow"`
	HeroHeading         string          `json:"heroHeading"`
	HeroSubheading      string          `json:"heroSubheading"`
	CtaPrimaryLabel     string          `json:"ctaPrimaryLabel"`
	CtaSecondaryLabel   string          `json:"ctaSecondaryLabel"`
	AboutHeading        string          `json:"aboutHeading"`
	AboutBody           string          `json:"aboutBody"`
	RoomsHeading        string          `json:"roomsHeading"`
	RoomsSubheading     string          `json:"roomsSubheading"`
	CabinsHeading       string          `json:"cabinsHeading"`
	CabinsSubheading    string          `json:"cabinsSubheading"`
	GalleryHeading      string          `json:"galleryHeading"`
	RestaurantHeading   string          `json:"restaurantHeading"`
	RestaurantSubheading string         `json:"restaurantSubheading"`
	ContactHeading      string          `json:"contactHeading"`
	ContactBody         string          `json:"contactBody"`
	HeroImageURL        string          `json:"heroImageUrl,omitempty"`
	AboutImageURL       string          `json:"aboutImageUrl,omitempty"`
	EnabledSections     map[string]bool `json:"enabledSections,omitempty"`
}

type HotelWebsite struct {
	HotelID     string      `db:"hotel_id" json:"hotelId"`
	Template    string      `db:"template" json:"template"`
	Theme       string      `db:"theme" json:"theme"`
	FontPairing string      `db:"font_pairing" json:"fontPairing"`
	Content     SiteContent `db:"content" json:"content"`
	CreatedAt   time.Time   `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updatedAt"`
}
