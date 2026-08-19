DROP INDEX IF EXISTS idx_menu_items_hotel_category;

ALTER TABLE menu_items DROP COLUMN category_id;
ALTER TABLE menu_items ADD COLUMN category TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_menu_items_hotel_category ON menu_items (hotel_id, category);

DROP TABLE IF EXISTS categories;
