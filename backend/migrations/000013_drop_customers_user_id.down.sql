ALTER TABLE customers
    ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_customers_user_id ON customers(user_id);
