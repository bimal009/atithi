package model

import "time"

type MemberStatus string

const (
	MemberStatusActive   MemberStatus = "active"
	MemberStatusInactive MemberStatus = "inactive"
)

type Member struct {
	ID        string       `db:"id" json:"id"`
	HotelID   string       `db:"hotel_id" json:"hotelId"`
	UserID    string       `db:"user_id" json:"userId"`
	RoleID    string       `db:"role_id" json:"roleId"`
	Status    MemberStatus `db:"status" json:"status"`
	InvitedBy *string      `db:"invited_by" json:"invitedBy,omitempty"`
	JoinedAt  *time.Time   `db:"joined_at" json:"joinedAt,omitempty"`
	CreatedAt time.Time    `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time    `db:"updated_at" json:"updatedAt"`
}
