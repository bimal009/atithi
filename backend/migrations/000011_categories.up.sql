CREATE TABLE categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_categories_hotel_name UNIQUE (hotel_id, name)
);

ALTER TABLE menu_items ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE RESTRICT;

INSERT INTO categories (hotel_id, name)
SELECT DISTINCT hotel_id, 'Uncategorized'
FROM menu_items
ON CONFLICT (hotel_id, name) DO NOTHING;

UPDATE menu_items mi
SET category_id = c.id
FROM categories c
WHERE c.hotel_id = mi.hotel_id AND c.name = 'Uncategorized' AND mi.category_id IS NULL;

ALTER TABLE menu_items ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE menu_items DROP COLUMN category;

DROP INDEX IF EXISTS idx_menu_items_hotel_category;
CREATE INDEX idx_menu_items_hotel_category ON menu_items (hotel_id, category_id);
