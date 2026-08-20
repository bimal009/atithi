ALTER TABLE reservations
    DROP COLUMN table_id;

CREATE TABLE reservation_tables (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    table_id       UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_reservation_tables UNIQUE (reservation_id, table_id)
);

CREATE INDEX idx_reservation_tables_reservation_id ON reservation_tables (reservation_id);
CREATE INDEX idx_reservation_tables_table_id ON reservation_tables (table_id);

CREATE TABLE reservation_cabins (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    cabin_id       UUID NOT NULL REFERENCES cabins(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_reservation_cabins UNIQUE (reservation_id, cabin_id)
);

CREATE INDEX idx_reservation_cabins_reservation_id ON reservation_cabins (reservation_id);
CREATE INDEX idx_reservation_cabins_cabin_id ON reservation_cabins (cabin_id);
