package model

import "time"

type Notification struct {
	ID        string    `db:"id" json:"id"`
	HotelID   string    `db:"hotel_id" json:"hotelId"`
	Type      string    `db:"type" json:"type"`
	Title     string    `db:"title" json:"title"`
	Subtitle  *string   `db:"subtitle" json:"subtitle,omitempty"`
	Read      bool      `db:"read" json:"read"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

const (
	NotifReservationCreated   = "reservation.created"
	NotifReservationUpdated   = "reservation.updated"
	NotifReservationCancelled = "reservation.cancelled"
	NotifReservationDeleted   = "reservation.deleted"

	NotifOrderCreated       = "order.created"
	NotifOrderUpdated       = "order.updated"
	NotifOrderStatusUpdated = "order.status_updated"
	NotifOrderCancelled     = "order.cancelled"
	NotifOrderDeleted       = "order.deleted"

	NotifCategoryCreated = "category.created"
	NotifCategoryUpdated = "category.updated"
	NotifCategoryDeleted = "category.deleted"

	NotifMenuSetCreated = "menuset.created"
	NotifMenuSetUpdated = "menuset.updated"
	NotifMenuSetDeleted = "menuset.deleted"

	NotifMenuItemCreated = "menuitem.created"
	NotifMenuItemUpdated = "menuitem.updated"
	NotifMenuItemDeleted = "menuitem.deleted"

	NotifBillingTypeCreated = "billingtype.created"
	NotifBillingTypeUpdated = "billingtype.updated"
	NotifBillingTypeDeleted = "billingtype.deleted"

	NotifAddOnCreated = "addon.created"
	NotifAddOnUpdated = "addon.updated"
	NotifAddOnDeleted = "addon.deleted"

	NotifSectionCreated = "section.created"
	NotifSectionUpdated = "section.updated"
	NotifSectionDeleted = "section.deleted"

	NotifSubMenuCreated = "submenu.created"
	NotifSubMenuUpdated = "submenu.updated"
	NotifSubMenuDeleted = "submenu.deleted"

	NotifRoomTypeCreated = "roomtype.created"
	NotifRoomTypeUpdated = "roomtype.updated"
	NotifRoomTypeDeleted = "roomtype.deleted"

	NotifRoomCreated = "room.created"
	NotifRoomUpdated = "room.updated"
	NotifRoomDeleted = "room.deleted"

	NotifCabinCreated = "cabin.created"
	NotifCabinUpdated = "cabin.updated"
	NotifCabinDeleted = "cabin.deleted"

	NotifTableCreated = "table.created"
	NotifTableUpdated = "table.updated"
	NotifTableDeleted = "table.deleted"

	NotifRoleCreated = "role.created"
	NotifRoleUpdated = "role.updated"
	NotifRoleDeleted = "role.deleted"

	NotifMemberAdded   = "member.added"
	NotifMemberUpdated = "member.updated"
	NotifMemberRemoved = "member.removed"

	NotifCustomerCreated = "customer.created"
	NotifCustomerUpdated = "customer.updated"
	NotifCustomerDeleted = "customer.deleted"
)
