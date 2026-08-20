DROP TABLE IF EXISTS reservation_cabins;
DROP TABLE IF EXISTS reservation_tables;

ALTER TABLE reservations
    ADD COLUMN table_id UUID REFERENCES dining_tables(id) ON DELETE CASCADE;
