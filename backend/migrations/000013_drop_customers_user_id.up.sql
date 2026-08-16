DROP INDEX IF EXISTS idx_customers_user_id;

ALTER TABLE customers
    DROP COLUMN IF EXISTS user_id;
