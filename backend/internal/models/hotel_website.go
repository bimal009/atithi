package model

import "time"

type SiteContent struct {
	HeroHeading    string `json:"heroHeading"`
	HeroSubheading string `json:"heroSubheading"`
	AboutHeading   string `json:"aboutHeading"`
	AboutBody      string `json:"aboutBody"`
	CtaLabel       string `json:"ctaLabel"`
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
