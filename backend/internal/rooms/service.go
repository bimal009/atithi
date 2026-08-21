package rooms

import (
	"context"
	"fmt"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type RoomService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateRoomRequest) (model.Room, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Room, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListRoomsQuery) (ListRoomsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateRoomRequest) (model.Room, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateRoomStatusRequest) (model.Room, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type roomService struct {
	slog     *slog.Logger
	repo     RoomRepo
	notifier notifications.Notifier
}

func NewRoomService(slog *slog.Logger, repo RoomRepo, notifier notifications.Notifier) RoomService {
	return &roomService{slog: slog, repo: repo, notifier: notifier}
}

func (s *roomService) Create(ctx context.Context, hotelID, userID string, req *CreateRoomRequest) (model.Room, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Room{}, err
	}

	images := req.Images
	if images == nil {
		images = []string{}
	}

	newRoom := &model.Room{
		ID:         uuid.NewString(),
		HotelID:    hotelID,
		RoomTypeID: req.RoomTypeID,
		Number:     req.Number,
		Floor:      req.Floor,
		Status:     StatusAvailable,
		Images:     images,
	}

	created, err := s.repo.Create(ctx, newRoom, userID)
	if err != nil {
		s.slog.Error("failed to create room", "hotel_id", hotelID, "error", err)
		return model.Room{}, err
	}

	s.slog.Info("room created", "room_id", created.ID, "hotel_id", hotelID)

	s.notifier.Notify(ctx, hotelID, model.NotifRoomCreated, fmt.Sprintf("Room '%s' added", created.Number), nil)

	return created, nil
}

func (s *roomService) Get(ctx context.Context, id, hotelID, userID string) (model.Room, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *roomService) GetAll(ctx context.Context, hotelID, userID string, query ListRoomsQuery) (ListRoomsResponse, error) {
	if err := validator.ValidateStruct(&query); err != nil {
		return ListRoomsResponse{}, err
	}
	if err := query.Pagination.Validate(); err != nil {
		return ListRoomsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.Status, query.Pagination)
	if err != nil {
		return ListRoomsResponse{}, err
	}

	return ListRoomsResponse{
		Rooms: list,
		Page:  query.Pagination.Page,
		Limit: query.Pagination.Limit,
		Total: total,
	}, nil
}

func (s *roomService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateRoomRequest) (model.Room, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Room{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Room{}, err
	}

	if req.RoomTypeID != nil {
		existing.RoomTypeID = *req.RoomTypeID
	}
	if req.Number != nil {
		existing.Number = *req.Number
	}
	if req.Floor != nil {
		existing.Floor = *req.Floor
	}
	if req.Images != nil {
		existing.Images = req.Images
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update room", "room_id", id, "error", err)
		return model.Room{}, err
	}

	s.slog.Info("room updated", "room_id", updated.ID)

	s.notifier.Notify(ctx, hotelID, model.NotifRoomUpdated, fmt.Sprintf("Room '%s' updated", updated.Number), nil)

	return updated, nil
}

func (s *roomService) UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateRoomStatusRequest) (model.Room, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Room{}, err
	}

	updated, err := s.repo.UpdateStatus(ctx, id, hotelID, userID, req.Status)
	if err != nil {
		s.slog.Error("failed to update room status", "room_id", id, "error", err)
		return model.Room{}, err
	}

	s.notifier.Notify(ctx, hotelID, model.NotifRoomUpdated, fmt.Sprintf("Room '%s' marked %s", updated.Number, updated.Status), nil)

	return updated, nil
}

func (s *roomService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete room", "room_id", id, "error", err)
		return err
	}

	s.slog.Info("room deleted", "room_id", id)

	s.notifier.Notify(ctx, hotelID, model.NotifRoomDeleted, "Room removed", nil)

	return nil
}
