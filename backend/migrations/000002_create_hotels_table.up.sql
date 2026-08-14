CREATE TABLE IF NOT EXISTS hotels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    logo_url        TEXT,
    address         TEXT NOT NULL,
    city            VARCHAR(100),
    country         VARCHAR(100) NOT NULL DEFAULT 'Nepal',
    phone_number    VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hotels_slug ON hotels (slug);
CREATE INDEX IF NOT EXISTS idx_hotels_phone_number ON hotels (phone_number);