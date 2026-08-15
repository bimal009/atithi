CREATE TABLE IF NOT EXISTS members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    invited_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_members_hotel_user UNIQUE (hotel_id, user_id),
    CONSTRAINT ck_members_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX IF NOT EXISTS idx_members_hotel_id ON members (hotel_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members (user_id);
CREATE INDEX IF NOT EXISTS idx_members_role_id ON members (role_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members (status);