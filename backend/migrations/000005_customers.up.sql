CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL,
    email           TEXT,
    notes           TEXT,
    document_type   TEXT,
    document_number TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_customers_hotel_phone UNIQUE (hotel_id, phone),
    CONSTRAINT ck_customers_document_type CHECK (
        document_type IS NULL OR document_type IN (
            'citizenship',
            'passport',
            'driving_license',
            'voter_id',
            'national_id'
        )
    ),
    CONSTRAINT ck_customers_document_pair CHECK (
        (document_type IS NULL) = (document_number IS NULL)
    )
);

CREATE UNIQUE INDEX uq_customers_hotel_document_number
    ON customers (hotel_id, document_number)
    WHERE document_number IS NOT NULL;
