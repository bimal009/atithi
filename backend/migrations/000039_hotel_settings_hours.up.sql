ALTER TABLE hotel_settings ADD COLUMN opening_time TEXT;
ALTER TABLE hotel_settings ADD COLUMN closing_time TEXT;
ALTER TABLE hotel_settings ADD COLUMN open_days TEXT[] NOT NULL DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}';
