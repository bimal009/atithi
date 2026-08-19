CREATE TABLE menu_item_add_ons (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    add_on_id    UUID NOT NULL REFERENCES add_ons(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (menu_item_id, add_on_id)
);

CREATE INDEX idx_menu_item_add_ons_add_on_id ON menu_item_add_ons (add_on_id);
