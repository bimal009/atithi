CREATE TABLE hotel_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id   UUID,
    url         TEXT NOT NULL,
    file_id     TEXT,
    file_size   INTEGER,
    section     TEXT,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotel_images_lookup ON hotel_images (hotel_id, entity_type, entity_id);
