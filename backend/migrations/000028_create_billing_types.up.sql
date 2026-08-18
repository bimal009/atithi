CREATE TABLE billing_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_billing_types_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_billing_types_hotel_id ON billing_types(hotel_id);

INSERT INTO billing_types (hotel_id, name)
SELECT DISTINCT hotel_id, pricing_unit FROM room_types
ON CONFLICT (hotel_id, name) DO NOTHING;

ALTER TABLE room_types
    ADD COLUMN billing_type_id UUID REFERENCES billing_types(id) ON DELETE RESTRICT;

UPDATE room_types rt
SET billing_type_id = bt.id
FROM billing_types bt
WHERE bt.hotel_id = rt.hotel_id AND bt.name = rt.pricing_unit;

ALTER TABLE room_types
    ALTER COLUMN billing_type_id SET NOT NULL,
    DROP COLUMN pricing_unit;

ALTER TABLE cabins
    ADD COLUMN base_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN billing_type_id UUID REFERENCES billing_types(id) ON DELETE RESTRICT;

ALTER TABLE cabins
    ALTER COLUMN base_price DROP DEFAULT,
    ADD CONSTRAINT ck_cabins_base_price CHECK (base_price >= 0);
