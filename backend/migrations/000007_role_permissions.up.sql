CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_permission_id ON role_permissions (permission_id);

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
