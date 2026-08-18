CREATE TABLE sections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_sections_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_sections_hotel_id ON sections(hotel_id);

INSERT INTO sections (hotel_id, name)
SELECT DISTINCT hotel_id, section FROM dining_tables
ON CONFLICT (hotel_id, name) DO NOTHING;

ALTER TABLE dining_tables
    ADD COLUMN section_id UUID REFERENCES sections(id) ON DELETE RESTRICT;

UPDATE dining_tables dt
SET section_id = s.id
FROM sections s
WHERE s.hotel_id = dt.hotel_id AND s.name = dt.section;

ALTER TABLE dining_tables
    ALTER COLUMN section_id SET NOT NULL,
    DROP COLUMN section;
