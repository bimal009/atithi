package model

import "time"

// HotelImage is the single source of truth for every image a hotel owns —
// its logo, and the photos for its cabins, rooms, tables, and gallery.
// EntityID is nil for hotel-singleton types (logo, gallery); otherwise it
// points at the owning cabin/room/table id.
type HotelImage struct {
	ID         string    `db:"id" json:"id"`
	HotelID    string    `db:"hotel_id" json:"hotelId"`
	EntityType string    `db:"entity_type" json:"entityType"`
	EntityID   *string   `db:"entity_id" json:"entityId,omitempty"`
	URL        string    `db:"url" json:"url"`
	FileID     *string   `db:"file_id" json:"fileId,omitempty"`
	FileSize   *int      `db:"file_size" json:"fileSize,omitempty"`
	Section    *string   `db:"section" json:"section,omitempty"`
	Position   int       `db:"position" json:"position"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
}
