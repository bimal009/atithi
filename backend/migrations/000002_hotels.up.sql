CREATE TABLE hotels (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) NOT NULL UNIQUE,
    description  TEXT,
    logo_url     TEXT,
    address      TEXT NOT NULL,
    city         VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    email        VARCHAR(255),
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotels_phone_number ON hotels (phone_number);
