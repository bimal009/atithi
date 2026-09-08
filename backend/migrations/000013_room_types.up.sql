CREATE TABLE room_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    billing_type_id UUID NOT NULL REFERENCES billing_types(id) ON DELETE RESTRICT,
    name            TEXT NOT NULL,
    base_price      NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    pricing_label   TEXT,
    capacity        INTEGER NOT NULL CHECK (capacity > 0),
    description     TEXT,
    amenities       TEXT[] NOT NULL DEFAULT '{}',
    restrictions    TEXT[] NOT NULL DEFAULT '{}',
    is_top_pick     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_room_types_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_room_types_billing_type_id ON room_types (billing_type_id);
