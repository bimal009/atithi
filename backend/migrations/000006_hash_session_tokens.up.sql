
ALTER TABLE sessions
    ALTER COLUMN expires_at TYPE timestamptz USING expires_at AT TIME ZONE 'UTC',
    ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE sessions RENAME COLUMN token TO token_hash;


UPDATE sessions SET token_hash = encode(sha256(convert_to(token_hash, 'UTF8')), 'hex');

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS absolute_expires_at timestamptz;
UPDATE sessions SET absolute_expires_at = created_at + interval '30 days' WHERE absolute_expires_at IS NULL;
ALTER TABLE sessions ALTER COLUMN absolute_expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);
