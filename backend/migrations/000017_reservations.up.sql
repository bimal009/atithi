CREATE TABLE reservations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_name  TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    party_size  INTEGER NOT NULL CHECK (party_size > 0),
    reserved_at TIMESTAMPTZ NOT NULL,
    reserved_by UUID NOT NULL REFERENCES members(id),
    status      TEXT NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_reserved_at ON reservations (reserved_at);
CREATE INDEX idx_reservations_hotel_status ON reservations (hotel_id, status);
