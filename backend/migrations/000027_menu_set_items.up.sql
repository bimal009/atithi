CREATE TABLE menu_set_items (
    menu_set_id  UUID NOT NULL REFERENCES menu_sets(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (menu_set_id, menu_item_id)
);

CREATE INDEX idx_menu_set_items_menu_item_id ON menu_set_items (menu_item_id);
