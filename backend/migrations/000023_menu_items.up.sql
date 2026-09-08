CREATE TABLE menu_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    dish_id     UUID NOT NULL REFERENCES dishes(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    food_type   TEXT NOT NULL
        CHECK (food_type IN ('veg', 'non-veg', 'vegan', 'egg')),
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount    NUMERIC(10, 2) CHECK (discount IS NULL OR discount >= 0),
    description TEXT,
    ingredients TEXT,
    available   BOOLEAN NOT NULL DEFAULT true,
    is_top_pick BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_menu_items_hotel_dish UNIQUE (hotel_id, dish_id)
);

CREATE INDEX idx_menu_items_dish_id ON menu_items (dish_id);
CREATE INDEX idx_menu_items_hotel_category ON menu_items (hotel_id, category_id);
