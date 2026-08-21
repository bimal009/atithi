CREATE TABLE hotel_settings (
    hotel_id               UUID PRIMARY KEY REFERENCES hotels(id) ON DELETE CASCADE,
    currency                VARCHAR(3) NOT NULL DEFAULT 'NPR',
    tax_percent             NUMERIC(5,2) NOT NULL DEFAULT 0,
    service_charge_percent  NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO hotel_settings (hotel_id)
SELECT id FROM hotels;
