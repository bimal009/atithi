CREATE TABLE cabins (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id      UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    cabin_type_id UUID NOT NULL REFERENCES cabin_types(id) ON DELETE RESTRICT,
    number        TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    capacity      INTEGER NOT NULL CHECK (capacity > 0),
    images        TEXT[] NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_cabins_hotel_number UNIQUE (hotel_id, number)
);

CREATE INDEX idx_cabins_hotel_id ON cabins(hotel_id);
CREATE INDEX idx_cabins_cabin_type_id ON cabins(cabin_type_id);
