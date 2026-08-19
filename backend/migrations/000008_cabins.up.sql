CREATE TABLE cabins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    billing_type_id UUID NOT NULL REFERENCES billing_types(id) ON DELETE RESTRICT,
    name            TEXT NOT NULL,
    number          TEXT NOT NULL,
    base_price      NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    capacity        INTEGER NOT NULL CHECK (capacity > 0),
    description     TEXT,
    amenities       TEXT[] NOT NULL DEFAULT '{}',
    restrictions    TEXT[] NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    images          TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_cabins_hotel_number UNIQUE (hotel_id, number)
);

CREATE INDEX idx_cabins_billing_type_id ON cabins (billing_type_id);
CREATE INDEX idx_cabins_hotel_status ON cabins (hotel_id, status);
