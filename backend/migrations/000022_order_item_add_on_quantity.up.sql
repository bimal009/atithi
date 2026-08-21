ALTER TABLE order_item_add_ons
    ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0);
