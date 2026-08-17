CREATE UNIQUE INDEX uq_customers_hotel_document_number
    ON customers (hotel_id, document_number)
    WHERE document_number IS NOT NULL;
