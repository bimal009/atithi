ALTER TABLE customers
    ADD CONSTRAINT ck_customers_document_type CHECK (
        document_type IS NULL OR document_type IN (
            'citizenship',
            'passport',
            'driving_license',
            'voter_id',
            'national_id'
        )
    ),
    ADD CONSTRAINT ck_customers_document_pair CHECK (
        (document_type IS NULL) = (document_number IS NULL)
    );
