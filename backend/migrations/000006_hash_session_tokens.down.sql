
DROP INDEX IF EXISTS idx_sessions_expires_at;

ALTER TABLE sessions DROP COLUMN IF EXISTS absolute_expires_at;

ALTER TABLE sessions RENAME COLUMN token_hash TO token;

ALTER TABLE sessions
    ALTER COLUMN expires_at TYPE timestamp USING expires_at AT TIME ZONE 'UTC',
    ALTER COLUMN created_at TYPE timestamp USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE timestamp USING updated_at AT TIME ZONE 'UTC';
