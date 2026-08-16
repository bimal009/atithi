ALTER TABLE customers
    DROP COLUMN IF EXISTS document_type,
    DROP COLUMN IF EXISTS document_number;
