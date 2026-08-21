package notifications

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type NotificationService interface {
	Create(ctx context.Context, hotelID string, req *CreateNotificationRequest) (model.Notification, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListNotificationsQuery) (ListNotificationsResponse, error)
	MarkRead(ctx context.Context, id, hotelID, userID string) (model.Notification, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type notificationService struct {
	slog *slog.Logger
	repo NotificationRepo
}

func NewNotificationService(slog *slog.Logger, repo NotificationRepo) NotificationService {
	return &notificationService{slog: slog, repo: repo}
}

func (s *notificationService) Create(ctx context.Context, hotelID string, req *CreateNotificationRequest) (model.Notification, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Notification{}, err
	}

	newNotification := &model.Notification{
		ID:       uuid.NewString(),
		HotelID:  hotelID,
		Type:     req.Type,
		Title:    req.Title,
		Subtitle: req.Subtitle,
	}

	created, err := s.repo.Create(ctx, newNotification)
	if err != nil {
		s.slog.Error("failed to create notification", "hotel_id", hotelID, "error", err)
		return model.Notification{}, err
	}

	s.slog.Info("notification created", "notification_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *notificationService) GetAll(ctx context.Context, hotelID, userID string, query ListNotificationsQuery) (ListNotificationsResponse, error) {
	if err := query.Pagination.Validate(); err != nil {
		return ListNotificationsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.Read, query.Pagination)
	if err != nil {
		return ListNotificationsResponse{}, err
	}

	return ListNotificationsResponse{
		Notifications: list,
		Page:          query.Pagination.Page,
		Limit:         query.Pagination.Limit,
		Total:         total,
	}, nil
}

func (s *notificationService) MarkRead(ctx context.Context, id, hotelID, userID string) (model.Notification, error) {
	updated, err := s.repo.MarkRead(ctx, id, hotelID, userID)
	if err != nil {
		s.slog.Error("failed to mark notification read", "notification_id", id, "error", err)
		return model.Notification{}, err
	}

	return updated, nil
}

func (s *notificationService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete notification", "notification_id", id, "error", err)
		return err
	}

	s.slog.Info("notification deleted", "notification_id", id)

	return nil
}
