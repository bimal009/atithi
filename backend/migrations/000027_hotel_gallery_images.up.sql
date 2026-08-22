CREATE TABLE hotel_gallery_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotel_gallery_images_hotel_id ON hotel_gallery_images (hotel_id, position);
