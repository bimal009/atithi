ALTER TABLE dining_tables
    ADD COLUMN status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance'));
