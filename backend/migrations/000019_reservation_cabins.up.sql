CREATE TABLE reservation_cabins (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    cabin_id       UUID NOT NULL REFERENCES cabins(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_reservation_cabins UNIQUE (reservation_id, cabin_id)
);

CREATE INDEX idx_reservation_cabins_reservation_id ON reservation_cabins (reservation_id);
CREATE INDEX idx_reservation_cabins_cabin_id ON reservation_cabins (cabin_id);
