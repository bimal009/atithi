package model

import "time"

type TextStyleOverride struct {
	Color    string `json:"color,omitempty"`
	FontSize string `json:"fontSize,omitempty"`
	Font     string `json:"font,omitempty"`
}

type SiteContent struct {
	HeroEyebrow          string                       `json:"heroEyebrow"`
	HeroHeading          string                       `json:"heroHeading"`
	HeroSubheading       string                       `json:"heroSubheading"`
	CtaPrimaryLabel      string                       `json:"ctaPrimaryLabel"`
	CtaSecondaryLabel    string                       `json:"ctaSecondaryLabel"`
	AboutHeading         string                       `json:"aboutHeading"`
	AboutBody            string                       `json:"aboutBody"`
	RoomsHeading         string                       `json:"roomsHeading"`
	RoomsSubheading      string                       `json:"roomsSubheading"`
	CabinsHeading        string                       `json:"cabinsHeading"`
	CabinsSubheading     string                       `json:"cabinsSubheading"`
	GalleryHeading       string                       `json:"galleryHeading"`
	RestaurantHeading    string                       `json:"restaurantHeading"`
	RestaurantSubheading string                       `json:"restaurantSubheading"`
	ContactHeading       string                       `json:"contactHeading"`
	ContactBody          string                       `json:"contactBody"`
	HeroImageURL         string                       `json:"heroImageUrl,omitempty"`
	HeroImageFileID      string                       `json:"heroImageFileId,omitempty"`
	AboutImageURL        string                       `json:"aboutImageUrl,omitempty"`
	AboutImageFileID     string                       `json:"aboutImageFileId,omitempty"`
	LogoURL              string                       `json:"logoUrl,omitempty"`
	LogoFileID           string                       `json:"logoFileId,omitempty"`
	LogoDisplay          string                       `json:"logoDisplay,omitempty"`
	EnabledSections      map[string]bool              `json:"enabledSections,omitempty"`
	SectionOrder         []string                     `json:"sectionOrder,omitempty"`
	TextStyles           map[string]TextStyleOverride `json:"textStyles,omitempty"`
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
