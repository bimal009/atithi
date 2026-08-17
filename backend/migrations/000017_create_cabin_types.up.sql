CREATE TABLE cabin_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    base_price      NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    pricing_unit    TEXT NOT NULL DEFAULT 'night'
        CHECK (pricing_unit IN ('night', 'hour', 'daycation', 'package')),
    pricing_label   TEXT,
    capacity        INTEGER NOT NULL CHECK (capacity > 0),
    description     TEXT,
    amenities       TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_cabin_types_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_cabin_types_hotel_id ON cabin_types(hotel_id);
