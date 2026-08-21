package notifications

import (
	"context"
	"encoding/json"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/ws"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationRepo interface {
	Create(ctx context.Context, notification *model.Notification) (model.Notification, error)
	ListForHotel(ctx context.Context, hotelID, userID string, read *bool, pagination model.Pagination) ([]model.Notification, int, error)
	MarkRead(ctx context.Context, id, hotelID, userID string) (model.Notification, error)
	MarkAllRead(ctx context.Context, hotelID, userID string) (int, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type notificationRepo struct {
	DB  *pgxpool.Pool
	hub *ws.Hub
}

func NewNotificationRepo(db *pgxpool.Pool, hub *ws.Hub) NotificationRepo {
	return &notificationRepo{DB: db, hub: hub}
}

func (r *notificationRepo) Create(ctx context.Context, notification *model.Notification) (model.Notification, error) {
	query := `
		INSERT INTO notifications (id, hotel_id, type, title, subtitle)
		SELECT $1::uuid, $2::uuid, $3::text, $4::text, $5::text
		WHERE EXISTS (SELECT 1 FROM hotels WHERE id = $2::uuid)
		RETURNING id, hotel_id, type, title, subtitle, read, created_at
	`

	var created model.Notification

	err := r.DB.QueryRow(
		ctx, query,
		notification.ID,
		notification.HotelID,
		notification.Type,
		notification.Title,
		notification.Subtitle,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Type,
		&created.Title,
		&created.Subtitle,
		&created.Read,
		&created.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Notification{}, apperr.ErrHotelNotFound
		}
		return model.Notification{}, err
	}

	payload, _ := json.Marshal(created)
	r.hub.Broadcast(&ws.Message{
		HotelID: created.HotelID,
		Type:    ws.Notification,
		Payload: payload,
	})

	return created, nil
}

func (r *notificationRepo) ListForHotel(ctx context.Context, hotelID, userID string, read *bool, pagination model.Pagination) ([]model.Notification, int, error) {
	query := `
		SELECT id, hotel_id, type, title, subtitle, read, created_at,
		       COUNT(*) OVER() AS total
		FROM notifications
		WHERE hotel_id = $1::uuid
		  AND ($2::bool IS NULL OR read = $2::bool)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = notifications.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY created_at DESC
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, read, userID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Notification, 0)
	var total int

	for rows.Next() {
		var notification model.Notification
		if err := rows.Scan(
			&notification.ID,
			&notification.HotelID,
			&notification.Type,
			&notification.Title,
			&notification.Subtitle,
			&notification.Read,
			&notification.CreatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, notification)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *notificationRepo) MarkRead(ctx context.Context, id, hotelID, userID string) (model.Notification, error) {
	query := `
		UPDATE notifications
		SET read = true
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = notifications.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, type, title, subtitle, read, created_at
	`

	var updated model.Notification

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Type,
		&updated.Title,
		&updated.Subtitle,
		&updated.Read,
		&updated.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Notification{}, apperr.ErrNotificationNotFound
		}
		return model.Notification{}, err
	}

	return updated, nil
}

func (r *notificationRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM notifications
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = notifications.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrNotificationNotFound
	}

	return nil
}
