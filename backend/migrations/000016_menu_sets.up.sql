CREATE TABLE menu_sets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    available   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_menu_sets_hotel_name UNIQUE (hotel_id, name)
);

CREATE TABLE menu_set_items (
    menu_set_id  UUID NOT NULL REFERENCES menu_sets(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (menu_set_id, menu_item_id)
);

CREATE INDEX idx_menu_set_items_menu_item_id ON menu_set_items (menu_item_id);
CREATE INDEX idx_menu_sets_hotel_available ON menu_sets (hotel_id, available);
