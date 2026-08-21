CREATE TABLE hotel_websites (
    hotel_id     UUID PRIMARY KEY REFERENCES hotels(id) ON DELETE CASCADE,
    template     TEXT NOT NULL DEFAULT 'aurora',
    theme        TEXT NOT NULL DEFAULT 'midnight-gold',
    font_pairing TEXT NOT NULL DEFAULT 'fraunces-public',
    content      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO hotel_websites (hotel_id)
SELECT id FROM hotels;
