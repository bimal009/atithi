ALTER TABLE hotel_websites ADD COLUMN is_live BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE hotel_websites ADD COLUMN slug TEXT;
UPDATE hotel_websites SET slug = hotel_id::text WHERE slug IS NULL;
ALTER TABLE hotel_websites ALTER COLUMN slug SET NOT NULL;
ALTER TABLE hotel_websites ADD CONSTRAINT hotel_websites_slug_key UNIQUE (slug);
ALTER TABLE hotels DROP COLUMN slug;