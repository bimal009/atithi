
CREATE TYPE role AS ENUM ('user', 'admin');

CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number   TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    image          TEXT,
    is_onboarded   BOOLEAN NOT NULL DEFAULT false,
    role           role NOT NULL DEFAULT 'user',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash          TEXT NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ NOT NULL,
    absolute_expires_at TIMESTAMPTZ NOT NULL,
    ip_address          TEXT,
    user_agent          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);

CREATE TABLE accounts (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id               TEXT NOT NULL,
    provider_id              TEXT NOT NULL,
    access_token             TEXT,
    refresh_token            TEXT,
    id_token                 TEXT,
    access_token_expires_at  TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scope                    TEXT,
    password                 TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);
CREATE UNIQUE INDEX uq_accounts_provider_account ON accounts (provider_id, account_id);


CREATE TABLE hotels (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) NOT NULL UNIQUE,
    description  TEXT,
    logo_url     TEXT,
    address      TEXT NOT NULL,
    city         VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    email        VARCHAR(255),
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotels_phone_number ON hotels (phone_number);


CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource    VARCHAR(50) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_permissions_resource_action UNIQUE (resource, action)
);

INSERT INTO permissions (resource, action, description) VALUES
    ('bookings', 'create', 'Create a new room booking'),
    ('bookings', 'read', 'View bookings'),
    ('bookings', 'update', 'Modify a booking'),
    ('bookings', 'delete', 'Delete a booking'),
    ('bookings', 'checkin', 'Check in a guest'),
    ('bookings', 'checkout', 'Check out a guest'),
    ('bookings', 'cancel', 'Cancel a booking'),
    ('rooms', 'create', 'Add a new room'),
    ('rooms', 'read', 'View rooms'),
    ('rooms', 'update', 'Edit room details'),
    ('rooms', 'delete', 'Remove a room'),
    ('rooms', 'manage_availability', 'Block/unblock room availability'),
    ('orders', 'create', 'Place a food/service order'),
    ('orders', 'read', 'View orders'),
    ('orders', 'update', 'Edit an order'),
    ('orders', 'update_status', 'Change order status'),
    ('orders', 'cancel', 'Cancel an order'),
    ('orders', 'refund', 'Refund an order'),
    ('menu', 'create', 'Add a menu item'),
    ('menu', 'read', 'View the menu'),
    ('menu', 'update', 'Edit a menu item'),
    ('menu', 'delete', 'Remove a menu item'),
    ('kitchen', 'view_queue', 'View kitchen order queue'),
    ('kitchen', 'update_status', 'Update food preparation status'),
    ('kitchen', 'manage_stations', 'Manage kitchen stations/printers'),
    ('tables', 'manage', 'Manage dine-in tables and QR codes'),
    ('inventory', 'create', 'Add inventory items'),
    ('inventory', 'read', 'View inventory'),
    ('inventory', 'update', 'Adjust stock levels'),
    ('inventory', 'delete', 'Remove inventory items'),
    ('payments', 'process', 'Process a payment'),
    ('payments', 'refund', 'Issue a refund'),
    ('payments', 'view', 'View payment records'),
    ('members', 'invite', 'Invite a team member'),
    ('members', 'read', 'View team members'),
    ('members', 'update', 'Edit a team member'),
    ('members', 'remove', 'Remove a team member'),
    ('roles', 'create', 'Create a role'),
    ('roles', 'read', 'View roles'),
    ('roles', 'update', 'Edit a role'),
    ('roles', 'delete', 'Delete a role'),
    ('roles', 'assign', 'Assign a role to a member'),
    ('reports', 'view', 'View reports and analytics'),
    ('reports', 'export', 'Export reports'),
    ('settings', 'manage', 'Manage hotel settings'),
    ('customers', 'read', 'View customer profiles'),
    ('customers', 'update', 'Edit customer profiles'),
    ('conversations', 'read', 'View omnichannel messages (Facebook, Instagram, WhatsApp)'),
    ('conversations', 'reply', 'Reply to guest messages across channels'),
    ('conversations', 'assign', 'Assign a conversation to a staff member'),
    ('conversations', 'manage_channels', 'Connect/disconnect Facebook, Instagram and WhatsApp channels');

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

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_permission_id ON role_permissions (permission_id);

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

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.hotel_id IS NULL AND r.slug = 'owner';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.hotel_id IS NULL AND r.slug = 'admin'
  AND NOT (p.resource = 'roles' AND p.action = 'delete');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM (VALUES
    ('manager', 'bookings', 'create'),
    ('manager', 'bookings', 'read'),
    ('manager', 'bookings', 'update'),
    ('manager', 'bookings', 'checkin'),
    ('manager', 'bookings', 'checkout'),
    ('manager', 'bookings', 'cancel'),
    ('manager', 'rooms', 'read'),
    ('manager', 'rooms', 'update'),
    ('manager', 'rooms', 'manage_availability'),
    ('manager', 'orders', 'read'),
    ('manager', 'orders', 'update'),
    ('manager', 'orders', 'update_status'),
    ('manager', 'orders', 'cancel'),
    ('manager', 'orders', 'refund'),
    ('manager', 'menu', 'read'),
    ('manager', 'kitchen', 'view_queue'),
    ('manager', 'tables', 'manage'),
    ('manager', 'inventory', 'read'),
    ('manager', 'inventory', 'update'),
    ('manager', 'payments', 'process'),
    ('manager', 'payments', 'view'),
    ('manager', 'members', 'read'),
    ('manager', 'members', 'invite'),
    ('manager', 'reports', 'view'),
    ('manager', 'reports', 'export'),
    ('manager', 'customers', 'read'),
    ('manager', 'customers', 'update'),
    ('manager', 'conversations', 'read'),
    ('manager', 'conversations', 'reply'),
    ('manager', 'conversations', 'assign'),

    ('front-desk', 'bookings', 'create'),
    ('front-desk', 'bookings', 'read'),
    ('front-desk', 'bookings', 'update'),
    ('front-desk', 'bookings', 'checkin'),
    ('front-desk', 'bookings', 'checkout'),
    ('front-desk', 'bookings', 'cancel'),
    ('front-desk', 'rooms', 'read'),
    ('front-desk', 'customers', 'read'),
    ('front-desk', 'customers', 'update'),
    ('front-desk', 'payments', 'process'),
    ('front-desk', 'payments', 'view'),

    ('housekeeping', 'rooms', 'read'),
    ('housekeeping', 'rooms', 'update'),
    ('housekeeping', 'rooms', 'manage_availability'),
    ('housekeeping', 'bookings', 'read'),

    ('kitchen-manager', 'kitchen', 'view_queue'),
    ('kitchen-manager', 'kitchen', 'update_status'),
    ('kitchen-manager', 'kitchen', 'manage_stations'),
    ('kitchen-manager', 'menu', 'create'),
    ('kitchen-manager', 'menu', 'read'),
    ('kitchen-manager', 'menu', 'update'),
    ('kitchen-manager', 'menu', 'delete'),
    ('kitchen-manager', 'inventory', 'read'),
    ('kitchen-manager', 'inventory', 'update'),
    ('kitchen-manager', 'orders', 'read'),
    ('kitchen-manager', 'orders', 'update_status'),

    ('chef', 'kitchen', 'view_queue'),
    ('chef', 'kitchen', 'update_status'),
    ('chef', 'orders', 'read'),

    ('waiter', 'orders', 'create'),
    ('waiter', 'orders', 'read'),
    ('waiter', 'orders', 'update_status'),
    ('waiter', 'tables', 'manage'),
    ('waiter', 'menu', 'read'),

    ('cashier', 'payments', 'process'),
    ('cashier', 'payments', 'view'),
    ('cashier', 'orders', 'read'),
    ('cashier', 'orders', 'update_status'),

    ('inventory-manager', 'inventory', 'create'),
    ('inventory-manager', 'inventory', 'read'),
    ('inventory-manager', 'inventory', 'update'),
    ('inventory-manager', 'inventory', 'delete'),

    ('marketing', 'reports', 'view'),
    ('marketing', 'customers', 'read'),

    ('support', 'customers', 'read'),
    ('support', 'customers', 'update'),
    ('support', 'orders', 'read'),
    ('support', 'bookings', 'read'),

    ('omnichannel', 'conversations', 'read'),
    ('omnichannel', 'conversations', 'reply'),
    ('omnichannel', 'conversations', 'assign'),
    ('omnichannel', 'conversations', 'manage_channels'),
    ('omnichannel', 'bookings', 'create'),
    ('omnichannel', 'bookings', 'read'),
    ('omnichannel', 'customers', 'read'),
    ('omnichannel', 'customers', 'update')
) AS g(role_slug, resource, action)
JOIN roles r       ON r.slug = g.role_slug AND r.hotel_id IS NULL
JOIN permissions p ON p.resource = g.resource AND p.action = g.action;

CREATE TABLE members (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id    UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status     VARCHAR(20) NOT NULL DEFAULT 'active',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at  TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_members_hotel_user UNIQUE (hotel_id, user_id),
    CONSTRAINT ck_members_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_members_user_id ON members (user_id);
CREATE INDEX idx_members_role_id ON members (role_id);
CREATE INDEX idx_members_hotel_status ON members (hotel_id, status);


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


CREATE TABLE billing_types (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_billing_types_hotel_name UNIQUE (hotel_id, name)
);

CREATE TABLE sections (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_sections_hotel_name UNIQUE (hotel_id, name)
);

CREATE TABLE sub_menus (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_sub_menus_hotel_name UNIQUE (hotel_id, name)
);


CREATE TABLE room_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    billing_type_id UUID NOT NULL REFERENCES billing_types(id) ON DELETE RESTRICT,
    name            TEXT NOT NULL,
    base_price      NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    pricing_label   TEXT,
    capacity        INTEGER NOT NULL CHECK (capacity > 0),
    description     TEXT,
    amenities       TEXT[] NOT NULL DEFAULT '{}',
    restrictions    TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_room_types_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_room_types_billing_type_id ON room_types (billing_type_id);

CREATE TABLE rooms (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    number       TEXT NOT NULL,
    floor        INTEGER NOT NULL CHECK (floor >= 0),
    status       TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    images       TEXT[] NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_rooms_hotel_number UNIQUE (hotel_id, number)
);

CREATE INDEX idx_rooms_room_type_id ON rooms (room_type_id);
CREATE INDEX idx_rooms_hotel_status ON rooms (hotel_id, status);


CREATE TABLE cabins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    billing_type_id UUID NOT NULL REFERENCES billing_types(id) ON DELETE RESTRICT,
    name            TEXT NOT NULL,
    number          TEXT NOT NULL,
    base_price      NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    capacity        INTEGER NOT NULL CHECK (capacity > 0),
    description     TEXT,
    amenities       TEXT[] NOT NULL DEFAULT '{}',
    restrictions    TEXT[] NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    images          TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_cabins_hotel_number UNIQUE (hotel_id, number)
);

CREATE INDEX idx_cabins_billing_type_id ON cabins (billing_type_id);
CREATE INDEX idx_cabins_hotel_status ON cabins (hotel_id, status);


CREATE TABLE dining_tables (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    name       TEXT NOT NULL,
    capacity   INTEGER NOT NULL CHECK (capacity > 0),
    status     TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    images     TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_dining_tables_hotel_name UNIQUE (hotel_id, name)
);

CREATE INDEX idx_dining_tables_section_id ON dining_tables (section_id);
CREATE INDEX idx_dining_tables_hotel_status ON dining_tables (hotel_id, status);

CREATE TABLE reservations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    table_id    UUID NOT NULL REFERENCES dining_tables(id) ON DELETE CASCADE,
    guest_name  TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    party_size  INTEGER NOT NULL CHECK (party_size > 0),
    reserved_at TIMESTAMPTZ NOT NULL,
    reserved_by TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_table_id ON reservations (table_id);
CREATE INDEX idx_reservations_reserved_at ON reservations (reserved_at);
CREATE INDEX idx_reservations_hotel_status ON reservations (hotel_id, status);
