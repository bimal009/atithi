CREATE TABLE testimonials (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_name   TEXT NOT NULL,
    stay_label   TEXT,
    quote        TEXT NOT NULL,
    rating       SMALLINT CHECK (rating BETWEEN 1 AND 5),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_testimonials_hotel_id ON testimonials (hotel_id);
