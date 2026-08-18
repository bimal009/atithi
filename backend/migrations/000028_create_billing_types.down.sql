ALTER TABLE cabins
    DROP CONSTRAINT ck_cabins_base_price,
    DROP COLUMN billing_type_id,
    DROP COLUMN base_price;

ALTER TABLE room_types
    ADD COLUMN pricing_unit TEXT;

UPDATE room_types rt
SET pricing_unit = bt.name
FROM billing_types bt
WHERE bt.id = rt.billing_type_id;

ALTER TABLE room_types
    ALTER COLUMN pricing_unit SET NOT NULL,
    ALTER COLUMN pricing_unit SET DEFAULT 'night',
    ADD CONSTRAINT room_types_pricing_unit_check CHECK (pricing_unit IN ('night', 'hour', 'daycation', 'package')),
    DROP COLUMN billing_type_id;

DROP TABLE billing_types;
