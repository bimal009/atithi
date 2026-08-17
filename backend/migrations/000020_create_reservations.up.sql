CREATE TABLE reservations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id       UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    table_id       UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
    guest_name     TEXT NOT NULL,
    guest_phone    TEXT NOT NULL,
    party_size     INTEGER NOT NULL CHECK (party_size > 0),
    reserved_at    TIMESTAMPTZ NOT NULL,
    status         TEXT NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_hotel_id ON reservations(hotel_id);
CREATE INDEX idx_reservations_table_id ON reservations(table_id);
CREATE INDEX idx_reservations_reserved_at ON reservations(reserved_at);
