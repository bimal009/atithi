package role

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelRole interface {
	CreateSystem(ctx context.Context, hotelID string, tx pgx.Tx) error
}

type hotelRole struct {
	db *pgxpool.Pool
}

func NewHotelRole(db *pgxpool.Pool) HotelRole {
	return &hotelRole{
		db: db,
	}
}

func (r *hotelRole) CreateSystem(ctx context.Context, hotelID string, tx pgx.Tx) error {
	query := `
		INSERT INTO roles (
			hotel_id,
			name,
			slug,
			description,
			is_system
		)
		VALUES
			($1, 'Owner', 'owner', 'Full access to everything', true),
			($1, 'Admin', 'admin', 'Manage hotel operations', true),
			($1, 'Manager', 'manager', 'Day-to-day operations manager', true),
			($1, 'Front Desk', 'front-desk', 'Handles check-in, check-out and bookings', true),
			($1, 'Housekeeping', 'housekeeping', 'Manages room readiness', true),
			($1, 'Kitchen Manager', 'kitchen-manager', 'Oversees kitchen operations and menu', true),
			($1, 'Chef', 'chef', 'Prepares food orders', true),
			($1, 'Waiter', 'waiter', 'Takes and serves dine-in orders', true),
			($1, 'Cashier', 'cashier', 'Handles payments at the counter', true),
			($1, 'Inventory Manager', 'inventory-manager', 'Manages stock and supplies', true),
			($1, 'Marketing', 'marketing', 'Views reports and customer data for campaigns', true),
			($1, 'Support', 'support', 'Handles customer support', true),
			($1, 'Omnichannel', 'omnichannel', 'Manages guest conversations across Facebook, Instagram and WhatsApp', true)
		ON CONFLICT DO NOTHING
	`

	_, err := tx.Exec(ctx, query, hotelID)
	return err
}
func (r *hotelRole) AssignSystemPermissions(ctx context.Context, hotelID string, tx pgx.Tx) error {
	batch := &pgx.Batch{}

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
		WHERE r.slug = 'owner' AND r.hotel_id = $1
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
		WHERE r.slug = 'admin' AND r.hotel_id = $1
		  AND NOT (p.resource = 'roles' AND p.action = 'delete')
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'manager' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('bookings','create'),('bookings','read'),('bookings','update'),('bookings','checkin'),('bookings','checkout'),('bookings','cancel'),
		    ('rooms','read'),('rooms','update'),('rooms','manage_availability'),
		    ('orders','read'),('orders','update'),('orders','update_status'),('orders','cancel'),('orders','refund'),
		    ('menu','read'),('kitchen','view_queue'),('tables','manage'),
		    ('inventory','read'),('inventory','update'),
		    ('payments','process'),('payments','view'),
		    ('members','read'),('members','invite'),
		    ('reports','view'),('reports','export'),
		    ('customers','read'),('customers','update'),
		    ('conversations','read'),('conversations','reply'),('conversations','assign')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'front-desk' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('bookings','create'),('bookings','read'),('bookings','update'),('bookings','checkin'),('bookings','checkout'),('bookings','cancel'),
		    ('rooms','read'),
		    ('customers','read'),('customers','update'),
		    ('payments','process'),('payments','view')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'housekeeping' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('rooms','read'),('rooms','update'),('rooms','manage_availability'),
		    ('bookings','read')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'kitchen-manager' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('kitchen','view_queue'),('kitchen','update_status'),('kitchen','manage_stations'),
		    ('menu','create'),('menu','read'),('menu','update'),('menu','delete'),
		    ('inventory','read'),('inventory','update'),
		    ('orders','read'),('orders','update_status')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'chef' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('kitchen','view_queue'),('kitchen','update_status'),
		    ('orders','read')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'waiter' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('orders','create'),('orders','read'),('orders','update_status'),
		    ('tables','manage'),('menu','read')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'cashier' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('payments','process'),('payments','view'),
		    ('orders','read'),('orders','update_status')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'inventory-manager' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('inventory','create'),('inventory','read'),('inventory','update'),('inventory','delete')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'marketing' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('reports','view'),('customers','read')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'support' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('customers','read'),('customers','update'),
		    ('orders','read'),('bookings','read')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id FROM roles r, permissions p
		WHERE r.slug = 'omnichannel' AND r.hotel_id = $1
		  AND (p.resource, p.action) IN (
		    ('conversations','read'),('conversations','reply'),('conversations','assign'),('conversations','manage_channels'),
		    ('bookings','create'),('bookings','read'),
		    ('customers','read'),('customers','update')
		  )
		ON CONFLICT DO NOTHING`, hotelID)

	br := tx.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < batch.Len(); i++ {
		if _, err := br.Exec(); err != nil {
			return fmt.Errorf("assign system permissions (statement %d): %w", i, err)
		}
	}
	return nil
}
