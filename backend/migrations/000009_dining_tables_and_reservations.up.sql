CREATE TABLE dining_tables (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    name       TEXT NOT NULL,
    capacity   INTEGER NOT NULL CHECK (capacity > 0),
    status     TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    images     TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_dining_tables_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_dining_tables_section_id ON dining_tables (section_id);
CREATE INDEX idx_dining_tables_hotel_status ON dining_tables (hotel_id, status);

CREATE TABLE reservations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    table_id    UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
    guest_name  TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    party_size  INTEGER NOT NULL CHECK (party_size > 0),
    reserved_at TIMESTAMPTZ NOT NULL,
    reserved_by TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_table_id ON reservations (table_id);
CREATE INDEX idx_reservations_reserved_at ON reservations (reserved_at);
CREATE INDEX idx_reservations_hotel_status ON reservations (hotel_id, status);
