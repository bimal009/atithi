CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource    VARCHAR(50) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_permissions_resource_action UNIQUE (resource, action)
);

INSERT INTO permissions (resource, action, description) VALUES
    ('hotels', 'create', 'Create a new hotel'),
    ('hotels', 'read', 'View hotel details'),
    ('hotels', 'update', 'Update hotel details'),
    ('hotels', 'delete', 'Delete hotel'),
    ('hotels', 'manage_settings', 'Manage hotel configuration and settings'),
    ('hotels', 'manage_branding', 'Manage logo, cover and theme'),

    ('rooms', 'create', 'Add new rooms and room types'),
    ('rooms', 'read', 'View room details and status'),
    ('rooms', 'update', 'Update room info and rates'),
    ('rooms', 'delete', 'Remove rooms'),
    ('rooms', 'manage_pricing', 'Set dynamic pricing and seasonal rates'),
    ('rooms', 'manage_availability', 'Block/unblock rooms'),

    ('bookings', 'create', 'Create a reservation'),
    ('bookings', 'read', 'View booking details'),
    ('bookings', 'update', 'Modify a booking'),
    ('bookings', 'cancel', 'Cancel a booking'),
    ('bookings', 'checkin', 'Check in guests'),
    ('bookings', 'checkout', 'Check out guests'),
    ('bookings', 'apply_discount', 'Apply discounts to bookings'),
    ('bookings', 'manage_overbooking', 'Override room capacity limits'),

    ('customers', 'create', 'Add customer profile'),
    ('customers', 'read', 'View customer details and history'),
    ('customers', 'update', 'Update customer info'),
    ('customers', 'delete', 'Delete customer profile'),
    ('customers', 'view_pii', 'View sensitive customer data (ID, passport)'),
    ('customers', 'export', 'Export customer data'),

    ('menu', 'create', 'Add menu items and categories'),
    ('menu', 'read', 'View menu'),
    ('menu', 'update', 'Update items, prices and availability'),
    ('menu', 'delete', 'Remove menu items'),
    ('menu', 'manage_combos', 'Create and manage meal sets/combos'),

    ('orders', 'create', 'Place a food or room service order'),
    ('orders', 'read', 'View orders'),
    ('orders', 'update', 'Modify order items'),
    ('orders', 'cancel', 'Cancel an order'),
    ('orders', 'update_status', 'Move order through kitchen/service states'),
    ('orders', 'refund', 'Issue order refund'),

    ('kitchen', 'view_queue', 'View live KOT / order queue'),
    ('kitchen', 'update_status', 'Mark items preparing / ready'),
    ('kitchen', 'manage_stations', 'Assign orders to kitchen stations'),

    ('tables', 'manage', 'Create, update, delete tables and sections'),
    ('tables', 'reserve', 'Reserve a table directly'),
    ('tables', 'update_status', 'Change table status (occupied, cleaning, available)'),

    ('inventory', 'create', 'Add inventory items and stock'),
    ('inventory', 'read', 'View stock levels and alerts'),
    ('inventory', 'update', 'Adjust stock levels and record wastage'),
    ('inventory', 'delete', 'Remove inventory items'),
    ('inventory', 'manage_suppliers', 'Manage suppliers and purchase orders'),

    ('payments', 'process', 'Collect and record payments'),
    ('payments', 'refund', 'Issue refunds'),
    ('payments', 'view', 'View transaction history'),
    ('payments', 'manage_methods', 'Configure payment gateways (eSewa, Khalti, Stripe)'),
    ('payments', 'split_bill', 'Split bills across guests or methods'),

    ('reports', 'view', 'View financial, occupancy and sales reports'),
    ('reports', 'export', 'Export reports to CSV/PDF'),
    ('reports', 'view_audit_logs', 'View system activity and audit trail'),

    ('members', 'create', 'Add staff member directly'),
    ('members', 'read', 'View staff list and profiles'),
    ('members', 'update', 'Update staff member details'),
    ('members', 'delete', 'Remove staff member from hotel'),
    ('members', 'invite', 'Send email/phone invites to new staff'),
    ('members', 'assign_role', 'Change a staff member role'),

    ('roles', 'create', 'Create custom roles'),
    ('roles', 'read', 'View roles and their permissions'),
    ('roles', 'update', 'Edit custom role permissions'),
    ('roles', 'delete', 'Delete custom roles'),

    ('conversations', 'read', 'View guest messages'),
    ('conversations', 'reply', 'Reply to guests'),
    ('conversations', 'assign', 'Assign conversations to staff'),
    ('conversations', 'manage_channels', 'Connect/disconnect Facebook, Instagram, WhatsApp'),

    ('reviews', 'read', 'View guest reviews and feedback'),
    ('reviews', 'reply', 'Respond to guest reviews'),
    ('reviews', 'manage_survey', 'Configure post-stay feedback surveys');
