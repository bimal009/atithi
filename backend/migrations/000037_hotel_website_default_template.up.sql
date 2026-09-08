CREATE TABLE hotel_websites (
    hotel_id     UUID PRIMARY KEY REFERENCES hotels(id) ON DELETE CASCADE,
    template     TEXT NOT NULL DEFAULT 'aurora',
    theme        TEXT NOT NULL DEFAULT 'midnight-gold',
    font_pairing TEXT NOT NULL DEFAULT 'fraunces-public',
    slug         TEXT NOT NULL UNIQUE,
    is_live      BOOLEAN NOT NULL DEFAULT false,
    content      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);