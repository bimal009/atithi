ALTER TABLE cabins
    ADD COLUMN base_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN pricing_unit TEXT NOT NULL DEFAULT 'night'
        CHECK (pricing_unit IN ('night', 'hour', 'daycation', 'package')),
    ADD COLUMN pricing_label TEXT;

ALTER TABLE cabins
    ALTER COLUMN base_price DROP DEFAULT,
    ADD CONSTRAINT ck_cabins_base_price CHECK (base_price >= 0);
