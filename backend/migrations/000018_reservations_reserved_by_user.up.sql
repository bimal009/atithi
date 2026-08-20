DELETE FROM reservations;

ALTER TABLE reservations
    ALTER COLUMN reserved_by DROP NOT NULL,
    ALTER COLUMN reserved_by TYPE UUID USING NULL,
    ALTER COLUMN reserved_by SET NOT NULL,
    ADD CONSTRAINT fk_reservations_reserved_by FOREIGN KEY (reserved_by) REFERENCES members(id);
