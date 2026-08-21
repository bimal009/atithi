ALTER TABLE orders
    ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    ADD COLUMN created_by UUID NOT NULL REFERENCES members(id);

ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled'));

CREATE INDEX idx_orders_room_id ON orders (room_id);

CREATE TABLE order_items (
    order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (order_id, menu_item_id)
);

CREATE INDEX idx_order_items_menu_item_id ON order_items (menu_item_id);

CREATE TABLE order_item_add_ons (
    order_id     UUID NOT NULL,
    menu_item_id UUID NOT NULL,
    add_on_id    UUID NOT NULL REFERENCES add_ons(id) ON DELETE RESTRICT,

    PRIMARY KEY (order_id, menu_item_id, add_on_id),
    FOREIGN KEY (order_id, menu_item_id) REFERENCES order_items (order_id, menu_item_id) ON DELETE CASCADE
);

CREATE INDEX idx_order_item_add_ons_add_on_id ON order_item_add_ons (add_on_id);
