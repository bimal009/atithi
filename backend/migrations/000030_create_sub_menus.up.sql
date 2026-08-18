CREATE TABLE sub_menus (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_sub_menus_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_sub_menus_hotel_id ON sub_menus(hotel_id);
