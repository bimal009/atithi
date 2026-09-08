CREATE TABLE hotel_settings (
    hotel_id               UUID PRIMARY KEY REFERENCES hotels(id) ON DELETE CASCADE,
    currency               VARCHAR(3) NOT NULL DEFAULT 'NPR',
    tax_percent            NUMERIC(5,2) NOT NULL DEFAULT 0,
    service_charge_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    map_url                TEXT,
    about_us               TEXT,
    amenities              TEXT[] NOT NULL DEFAULT '{}',
    opening_time           TEXT,
    closing_time           TEXT,
    open_days              TEXT[] NOT NULL DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}',
    whatsapp_number        TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
