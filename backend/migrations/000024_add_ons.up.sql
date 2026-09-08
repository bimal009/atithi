CREATE TABLE add_ons (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    dish_id    UUID NOT NULL REFERENCES dishes(id) ON DELETE RESTRICT,
    price      NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    available  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_add_ons_hotel_dish UNIQUE (hotel_id, dish_id)
);

CREATE INDEX idx_add_ons_dish_id ON add_ons (dish_id);
CREATE INDEX idx_add_ons_hotel_available ON add_ons (hotel_id, available);
