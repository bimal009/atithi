ALTER TABLE reservations
    ADD COLUMN reserved_by TEXT NOT NULL DEFAULT 'Front desk';

ALTER TABLE reservations ALTER COLUMN reserved_by DROP DEFAULT;
