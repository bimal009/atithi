CREATE TABLE accounts (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id               TEXT NOT NULL,
    provider_id              TEXT NOT NULL,
    user_id                  UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    access_token             TEXT,
    refresh_token            TEXT,
    id_token                 TEXT,
    access_token_expires_at  TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scope                    TEXT,
    password                 TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_accounts_provider_account UNIQUE (provider_id, account_id)
);
CREATE INDEX idx_accounts_user_id ON accounts (user_id);
