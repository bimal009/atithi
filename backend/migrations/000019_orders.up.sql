CREATE TABLE orders (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    table_id     UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
    customer_id  UUID REFERENCES customers(id) ON DELETE SET NULL,
    status       TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_hotel_status ON orders (hotel_id, status);
CREATE INDEX idx_orders_table_id ON orders (table_id);
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
