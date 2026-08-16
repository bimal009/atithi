ALTER TABLE customers
    DROP CONSTRAINT IF EXISTS ck_customers_document_type,
    DROP CONSTRAINT IF EXISTS ck_customers_document_pair;
