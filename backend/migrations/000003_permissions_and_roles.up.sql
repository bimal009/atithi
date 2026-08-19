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
