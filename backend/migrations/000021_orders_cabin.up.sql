ALTER TABLE orders
    ADD COLUMN cabin_id UUID REFERENCES cabins(id) ON DELETE SET NULL;

CREATE INDEX idx_orders_cabin_id ON orders (cabin_id);
