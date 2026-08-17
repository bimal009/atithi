ALTER TABLE room_types
    ADD COLUMN restrictions TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE cabin_types
    ADD COLUMN restrictions TEXT[] NOT NULL DEFAULT '{}';
