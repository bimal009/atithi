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
    restrictions    TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_cabin_types_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_cabin_types_hotel_id ON cabin_types(hotel_id);

ALTER TABLE cabins
    DROP CONSTRAINT ck_cabins_base_price,
    DROP CONSTRAINT ck_cabins_capacity,
    ADD COLUMN cabin_type_id UUID REFERENCES cabin_types(id) ON DELETE RESTRICT;

ALTER TABLE cabins
    DROP COLUMN name,
    DROP COLUMN base_price,
    DROP COLUMN pricing_unit,
    DROP COLUMN pricing_label,
    DROP COLUMN capacity,
    DROP COLUMN description,
    DROP COLUMN amenities,
    DROP COLUMN restrictions;

ALTER TABLE cabins ALTER COLUMN cabin_type_id SET NOT NULL;

CREATE INDEX idx_cabins_cabin_type_id ON cabins(cabin_type_id);
