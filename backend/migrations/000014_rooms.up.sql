CREATE TABLE rooms (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    number       TEXT NOT NULL,
    floor        INTEGER NOT NULL CHECK (floor >= 0),
    status       TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_rooms_hotel_number UNIQUE (hotel_id, number)
);

CREATE INDEX idx_rooms_room_type_id ON rooms (room_type_id);
CREATE INDEX idx_rooms_hotel_status ON rooms (hotel_id, status);
