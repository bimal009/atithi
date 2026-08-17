ALTER TABLE cabins
    DROP CONSTRAINT cabins_cabin_type_id_fkey,
    DROP COLUMN cabin_type_id,
    ADD COLUMN name TEXT NOT NULL DEFAULT '',
    ADD COLUMN base_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN pricing_unit TEXT NOT NULL DEFAULT 'night'
        CHECK (pricing_unit IN ('night', 'hour', 'daycation', 'package')),
    ADD COLUMN pricing_label TEXT,
    ADD COLUMN capacity INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN description TEXT,
    ADD COLUMN amenities TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN restrictions TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE cabins
    ALTER COLUMN name DROP DEFAULT,
    ALTER COLUMN base_price DROP DEFAULT,
    ALTER COLUMN capacity DROP DEFAULT,
    ADD CONSTRAINT ck_cabins_base_price CHECK (base_price >= 0),
    ADD CONSTRAINT ck_cabins_capacity CHECK (capacity > 0);

DROP TABLE cabin_types;
