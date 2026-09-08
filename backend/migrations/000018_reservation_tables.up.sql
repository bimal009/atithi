CREATE TABLE reservation_tables (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    table_id       UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_reservation_tables UNIQUE (reservation_id, table_id)
);

CREATE INDEX idx_reservation_tables_reservation_id ON reservation_tables (reservation_id);
CREATE INDEX idx_reservation_tables_table_id ON reservation_tables (table_id);
