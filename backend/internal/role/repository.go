package role

import (
	"context"
	"fmt"
	"sort"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	SlugOwner            = "owner"
	SlugAdmin            = "admin"
	SlugManager          = "manager"
	SlugFrontDesk        = "front-desk"
	SlugHousekeeping     = "housekeeping"
	SlugKitchenManager   = "kitchen-manager"
	SlugChef             = "chef"
	SlugWaiter           = "waiter"
	SlugCashier          = "cashier"
	SlugInventoryManager = "inventory-manager"
	SlugMarketing        = "marketing"
	SlugSupport          = "support"
	SlugOmnichannel      = "omnichannel"
)

type systemRole struct {
	Slug        string
	Name        string
	Description string
}

// systemRoles is the set of roles every hotel gets on creation.
var systemRoles = []systemRole{
	{SlugOwner, "Owner", "Full access to everything"},
	{SlugAdmin, "Admin", "Manage hotel operations"},
	{SlugManager, "Manager", "Day-to-day operations manager"},
	{SlugFrontDesk, "Front Desk", "Handles check-in, check-out and bookings"},
	{SlugHousekeeping, "Housekeeping", "Manages room readiness"},
	{SlugKitchenManager, "Kitchen Manager", "Oversees kitchen operations and menu"},
	{SlugChef, "Chef", "Prepares food orders"},
	{SlugWaiter, "Waiter", "Takes and serves dine-in orders"},
	{SlugCashier, "Cashier", "Handles payments at the counter"},
	{SlugInventoryManager, "Inventory Manager", "Manages stock and supplies"},
	{SlugMarketing, "Marketing", "Views reports and customer data for campaigns"},
	{SlugSupport, "Support", "Handles customer support"},
	{SlugOmnichannel, "Omnichannel", "Manages guest conversations across Facebook, Instagram and WhatsApp"},
}

type permissionRef struct {
	Resource string
	Action   string
}

// systemGrants maps a system role slug to the permissions it receives.
//
// owner and admin are absent on purpose: owner gets every permission and admin
// gets every permission except roles:delete, both expressed directly in SQL so
// they pick up new permissions automatically as they are seeded.
var systemGrants = map[string][]permissionRef{
	SlugManager: {
		{"bookings", "create"}, {"bookings", "read"}, {"bookings", "update"},
		{"bookings", "checkin"}, {"bookings", "checkout"}, {"bookings", "cancel"},
		{"rooms", "read"}, {"rooms", "update"}, {"rooms", "manage_availability"},
		{"orders", "read"}, {"orders", "update"}, {"orders", "update_status"},
		{"orders", "cancel"}, {"orders", "refund"},
		{"menu", "read"},
		{"kitchen", "view_queue"},
		{"tables", "manage"},
		{"inventory", "read"}, {"inventory", "update"},
		{"payments", "process"}, {"payments", "view"},
		{"members", "read"}, {"members", "invite"},
		{"reports", "view"}, {"reports", "export"},
		{"customers", "read"}, {"customers", "update"},
		{"conversations", "read"}, {"conversations", "reply"}, {"conversations", "assign"},
	},
	SlugFrontDesk: {
		{"bookings", "create"}, {"bookings", "read"}, {"bookings", "update"},
		{"bookings", "checkin"}, {"bookings", "checkout"}, {"bookings", "cancel"},
		{"rooms", "read"},
		{"customers", "read"}, {"customers", "update"},
		{"payments", "process"}, {"payments", "view"},
	},
	SlugHousekeeping: {
		{"rooms", "read"}, {"rooms", "update"}, {"rooms", "manage_availability"},
		{"bookings", "read"},
	},
	SlugKitchenManager: {
		{"kitchen", "view_queue"}, {"kitchen", "update_status"}, {"kitchen", "manage_stations"},
		{"menu", "create"}, {"menu", "read"}, {"menu", "update"}, {"menu", "delete"},
		{"inventory", "read"}, {"inventory", "update"},
		{"orders", "read"}, {"orders", "update_status"},
	},
	SlugChef: {
		{"kitchen", "view_queue"}, {"kitchen", "update_status"},
		{"orders", "read"},
	},
	SlugWaiter: {
		{"orders", "create"}, {"orders", "read"}, {"orders", "update_status"},
		{"tables", "manage"},
		{"menu", "read"},
	},
	SlugCashier: {
		{"payments", "process"}, {"payments", "view"},
		{"orders", "read"}, {"orders", "update_status"},
	},
	SlugInventoryManager: {
		{"inventory", "create"}, {"inventory", "read"},
		{"inventory", "update"}, {"inventory", "delete"},
	},
	SlugMarketing: {
		{"reports", "view"},
		{"customers", "read"},
	},
	SlugSupport: {
		{"customers", "read"}, {"customers", "update"},
		{"orders", "read"},
		{"bookings", "read"},
	},
	SlugOmnichannel: {
		{"conversations", "read"}, {"conversations", "reply"},
		{"conversations", "assign"}, {"conversations", "manage_channels"},
		{"bookings", "create"}, {"bookings", "read"},
		{"customers", "read"}, {"customers", "update"},
	},
}

// flattenGrants expands systemGrants into three parallel arrays for unnest.
// Slugs are sorted so error messages and query plans stay stable across runs.
func flattenGrants() (roleSlugs, resources, actions []string) {
	slugs := make([]string, 0, len(systemGrants))
	for slug := range systemGrants {
		slugs = append(slugs, slug)
	}
	sort.Strings(slugs)

	for _, slug := range slugs {
		for _, p := range systemGrants[slug] {
			roleSlugs = append(roleSlugs, slug)
			resources = append(resources, p.Resource)
			actions = append(actions, p.Action)
		}
	}
	return roleSlugs, resources, actions
}

type HotelRole interface {
	CreateSystem(ctx context.Context, hotelID string, tx pgx.Tx) error
	AssignSystemPermissions(ctx context.Context, hotelID string, tx pgx.Tx) error
	ValidateGrants(ctx context.Context) error
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
	slugs := make([]string, len(systemRoles))
	names := make([]string, len(systemRoles))
	descriptions := make([]string, len(systemRoles))
	for i, sr := range systemRoles {
		slugs[i] = sr.Slug
		names[i] = sr.Name
		descriptions[i] = sr.Description
	}

	const query = `
		INSERT INTO roles (hotel_id, name, slug, description, is_system)
		SELECT $1, sr.name, sr.slug, sr.description, true
		FROM unnest($2::text[], $3::text[], $4::text[]) AS sr(slug, name, description)
		ON CONFLICT DO NOTHING
	`

	if _, err := tx.Exec(ctx, query, hotelID, slugs, names, descriptions); err != nil {
		return fmt.Errorf("create system roles for hotel %s: %w", hotelID, err)
	}
	return nil
}

func (r *hotelRole) AssignSystemPermissions(ctx context.Context, hotelID string, tx pgx.Tx) error {
	roleSlugs, resources, actions := flattenGrants()

	batch := &pgx.Batch{}

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id
		FROM roles r CROSS JOIN permissions p
		WHERE r.hotel_id = $1 AND r.slug = $2
		ON CONFLICT DO NOTHING`, hotelID, SlugOwner)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id
		FROM roles r CROSS JOIN permissions p
		WHERE r.hotel_id = $1 AND r.slug = $2
		  AND NOT (p.resource = 'roles' AND p.action = 'delete')
		ON CONFLICT DO NOTHING`, hotelID, SlugAdmin)

	batch.Queue(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id
		FROM unnest($2::text[], $3::text[], $4::text[]) AS g(role_slug, resource, action)
		JOIN roles r       ON r.slug = g.role_slug AND r.hotel_id = $1
		JOIN permissions p ON p.resource = g.resource AND p.action = g.action
		ON CONFLICT DO NOTHING`, hotelID, roleSlugs, resources, actions)

	stages := []string{SlugOwner, SlugAdmin, "grant matrix"}

	br := tx.SendBatch(ctx, batch)

	var execErr error
	for _, stage := range stages {
		if _, err := br.Exec(); err != nil {
			execErr = fmt.Errorf("assign system permissions (%s) for hotel %s: %w", stage, hotelID, err)
			break
		}
	}

	// Close must happen exactly once, and before the caller touches tx again.
	closeErr := br.Close()

	if execErr != nil {
		return execErr
	}
	if closeErr != nil {
		return fmt.Errorf("assign system permissions for hotel %s: %w", hotelID, closeErr)
	}
	return nil
}

// ValidateGrants checks the grant matrix against reality: every role slug it
// references must be a system role, and every permission pair must exist in the
// permissions table. Without this a renamed permission silently grants nothing
// and the role is quietly under-permissioned. Call it once at startup.
func (r *hotelRole) ValidateGrants(ctx context.Context) error {
	known := make(map[string]struct{}, len(systemRoles))
	for _, sr := range systemRoles {
		known[sr.Slug] = struct{}{}
	}

	var unknownRoles []string
	for slug := range systemGrants {
		if _, ok := known[slug]; !ok {
			unknownRoles = append(unknownRoles, slug)
		}
	}
	if len(unknownRoles) > 0 {
		sort.Strings(unknownRoles)
		return fmt.Errorf("grant matrix references unknown system roles: %v", unknownRoles)
	}

	_, resources, actions := flattenGrants()

	const query = `
		SELECT DISTINCT g.resource, g.action
		FROM unnest($1::text[], $2::text[]) AS g(resource, action)
		LEFT JOIN permissions p ON p.resource = g.resource AND p.action = g.action
		WHERE p.id IS NULL
		ORDER BY 1, 2
	`

	rows, err := r.db.Query(ctx, query, resources, actions)
	if err != nil {
		return fmt.Errorf("validate grant matrix: %w", err)
	}
	defer rows.Close()

	var missing []string
	for rows.Next() {
		var resource, action string
		if err := rows.Scan(&resource, &action); err != nil {
			return fmt.Errorf("validate grant matrix: %w", err)
		}
		missing = append(missing, resource+":"+action)
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("validate grant matrix: %w", err)
	}

	if len(missing) > 0 {
		return fmt.Errorf("grant matrix references permissions that do not exist: %v", missing)
	}
	return nil
}
