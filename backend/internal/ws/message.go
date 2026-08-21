package ws

import (
	"encoding/json"
)

type MessageType string

const (
	OrderCreated      MessageType = "order.created"
	OrderUpdated      MessageType = "order.updated"
	OrderStatusUpdate MessageType = "order.status_update"
	OrderCancelled    MessageType = "order.cancelled"
	OrderDeleted      MessageType = "order.deleted"

	BookingCreated  MessageType = "booking.created"
	BookingCheckin  MessageType = "booking.checkin"
	BookingCheckout MessageType = "booking.checkout"

	ConversationMessage  MessageType = "conversation.message"  // new inbound message from a guest
	ConversationAssigned MessageType = "conversation.assigned" // conversation assigned to a staff member

	Notification MessageType = "notification"
)

const (
	PermKitchenViewQueue         = "kitchen:view_queue"
	PermBookingsRead             = "bookings:read"
	PermConversationsRead        = "conversations:read"
	PermConversationsReply       = "conversations:reply"
	PermConversationsAssign      = "conversations:assign"
	PermConversationsManageChans = "conversations:manage_channels"
)

type Message struct {
	HotelID     string
	UserID      string
	Permissions []string
	Type        MessageType
	Payload     json.RawMessage
}

type outboundEnvelope struct {
	Type    MessageType     `json:"type"`
	Payload json.RawMessage `json:"payload"`
}
