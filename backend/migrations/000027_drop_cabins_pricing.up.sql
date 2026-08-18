ALTER TABLE cabins
    DROP CONSTRAINT ck_cabins_base_price,
    DROP COLUMN base_price,
    DROP COLUMN pricing_unit,
    DROP COLUMN pricing_label;
