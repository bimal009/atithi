CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID REFERENCES hotels(id) ON DELETE CASCADE,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_roles_global_slug ON roles (slug) WHERE hotel_id IS NULL;
CREATE UNIQUE INDEX uq_roles_hotel_slug ON roles (hotel_id, slug) WHERE hotel_id IS NOT NULL;

INSERT INTO roles (hotel_id, name, slug, description, is_system) VALUES
    (NULL, 'Owner', 'owner', 'Full access to everything', true),
    (NULL, 'Admin', 'admin', 'Manage hotel operations', true),
    (NULL, 'Manager', 'manager', 'Day-to-day operations manager', true),
    (NULL, 'Front Desk', 'front-desk', 'Handles check-in, check-out and bookings', true),
    (NULL, 'Housekeeping', 'housekeeping', 'Manages room readiness', true),
    (NULL, 'Kitchen Manager', 'kitchen-manager', 'Oversees kitchen operations and menu', true),
    (NULL, 'Chef', 'chef', 'Prepares food orders', true),
    (NULL, 'Waiter', 'waiter', 'Takes and serves dine-in orders', true),
    (NULL, 'Cashier', 'cashier', 'Handles payments at the counter', true),
    (NULL, 'Inventory Manager', 'inventory-manager', 'Manages stock and supplies', true),
    (NULL, 'Marketing', 'marketing', 'Views reports and customer data for campaigns', true),
    (NULL, 'Support', 'support', 'Handles customer support', true),
    (NULL, 'Omnichannel', 'omnichannel', 'Manages guest conversations across Facebook, Instagram and WhatsApp', true);
