ALTER TABLE hotels ADD COLUMN logo_url TEXT;
ALTER TABLE dining_tables ADD COLUMN images TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE rooms ADD COLUMN images TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE cabins ADD COLUMN images TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE hotel_gallery_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    file_id    TEXT,
    section    TEXT NOT NULL DEFAULT 'General',
    position   INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotel_gallery_images_hotel_id ON hotel_gallery_images (hotel_id, position);

CREATE OR REPLACE FUNCTION enforce_hotel_gallery_images_limit() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM hotel_gallery_images WHERE hotel_id = NEW.hotel_id) >= 60 THEN
        RAISE EXCEPTION 'hotel gallery image limit reached' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hotel_gallery_images_limit
    BEFORE INSERT ON hotel_gallery_images
    FOR EACH ROW
    EXECUTE FUNCTION enforce_hotel_gallery_images_limit();

DROP TABLE hotel_images;
