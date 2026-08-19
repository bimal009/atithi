DROP INDEX IF EXISTS idx_categories_sub_menu_id;
ALTER TABLE categories DROP COLUMN sub_menu_id;

CREATE TABLE category_sub_menus (
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    sub_menu_id UUID NOT NULL REFERENCES sub_menus(id) ON DELETE RESTRICT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (category_id, sub_menu_id)
);

CREATE INDEX idx_category_sub_menus_sub_menu_id ON category_sub_menus (sub_menu_id);
