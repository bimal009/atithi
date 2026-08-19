DROP TABLE IF EXISTS category_sub_menus;

ALTER TABLE categories ADD COLUMN sub_menu_id UUID REFERENCES sub_menus(id) ON DELETE RESTRICT;
CREATE INDEX idx_categories_sub_menu_id ON categories (sub_menu_id);
