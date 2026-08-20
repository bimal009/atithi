ALTER TABLE reservations
    DROP CONSTRAINT fk_reservations_reserved_by,
    ALTER COLUMN reserved_by TYPE TEXT USING reserved_by::text;
