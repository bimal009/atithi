CREATE TABLE order_item_add_ons (
    order_id     UUID NOT NULL,
    menu_item_id UUID NOT NULL,
    add_on_id    UUID NOT NULL REFERENCES add_ons(id) ON DELETE RESTRICT,
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

    PRIMARY KEY (order_id, menu_item_id, add_on_id),
    FOREIGN KEY (order_id, menu_item_id) REFERENCES order_items (order_id, menu_item_id) ON DELETE CASCADE
);

CREATE INDEX idx_order_item_add_ons_add_on_id ON order_item_add_ons (add_on_id);
