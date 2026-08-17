CREATE TABLE dining_tables (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    capacity    INTEGER NOT NULL CHECK (capacity > 0),
    section     TEXT NOT NULL CHECK (section IN ('indoor', 'outdoor', 'rooftop')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_dining_tables_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_dining_tables_hotel_id ON dining_tables(hotel_id);
