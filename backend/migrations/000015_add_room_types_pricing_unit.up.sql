ALTER TABLE room_types
    ADD COLUMN pricing_unit TEXT NOT NULL DEFAULT 'night'
        CHECK (pricing_unit IN ('night', 'hour', 'daycation', 'package')),
    ADD COLUMN pricing_label TEXT;
