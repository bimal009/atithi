ALTER TABLE hotel_settings ADD COLUMN about_us TEXT;
ALTER TABLE hotel_settings ADD COLUMN amenities TEXT[] NOT NULL DEFAULT '{}';
