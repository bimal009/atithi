CREATE TABLE dishes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    image_url  TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_dishes_name ON dishes (lower(name));

CREATE TABLE menu_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    dish_id     UUID NOT NULL REFERENCES dishes(id) ON DELETE RESTRICT,
    category    TEXT NOT NULL,
    food_type   TEXT NOT NULL
        CHECK (food_type IN ('veg', 'non-veg', 'vegan', 'egg')),
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount    NUMERIC(10, 2) CHECK (discount IS NULL OR discount >= 0),
    description TEXT,
    ingredients TEXT,
    available   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_menu_items_hotel_dish UNIQUE (hotel_id, dish_id)
);

CREATE INDEX idx_menu_items_dish_id ON menu_items (dish_id);
CREATE INDEX idx_menu_items_hotel_category ON menu_items (hotel_id, category);
