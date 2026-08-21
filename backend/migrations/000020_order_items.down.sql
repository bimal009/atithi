DROP TABLE IF EXISTS order_item_add_ons;
DROP TABLE IF EXISTS order_items;

ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled'));

ALTER TABLE orders
    DROP COLUMN room_id,
    DROP COLUMN created_by;
