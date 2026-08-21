package orders

import (
	"context"
	"encoding/json"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/ws"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type OrderService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateOrderRequest) (model.Order, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Order, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListOrdersQuery) (ListOrdersResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateOrderRequest) (model.Order, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateOrderStatusRequest) (model.Order, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type orderService struct {
	slog *slog.Logger
	repo OrderRepo
	hub  *ws.Hub
}

func NewOrderService(slog *slog.Logger, repo OrderRepo, hub *ws.Hub) OrderService {
	return &orderService{slog: slog, repo: repo, hub: hub}
}

func (s *orderService) broadcast(hotelID string, msgType ws.MessageType, payload json.RawMessage) {
	s.hub.Broadcast(&ws.Message{
		HotelID:     hotelID,
		Permissions: []string{ws.PermKitchenViewQueue},
		Type:        msgType,
		Payload:     payload,
	})
}

func (s *orderService) broadcastOrder(order model.Order, msgType ws.MessageType) {
	payload, err := json.Marshal(order)
	if err != nil {
		s.slog.Error("failed to marshal order for broadcast", "order_id", order.ID, "error", err)
		return
	}
	s.broadcast(order.HotelID, msgType, payload)
}

func (s *orderService) Create(ctx context.Context, hotelID, userID string, req *CreateOrderRequest) (model.Order, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Order{}, err
	}

	newOrder := &model.Order{
		ID:         uuid.NewString(),
		HotelID:    hotelID,
		TableID:    req.TableID,
		RoomID:     req.RoomID,
		CabinID:    req.CabinID,
		CustomerID: req.CustomerID,
		Status:     StatusPending,
		Notes:      req.Notes,
	}

	created, err := s.repo.Create(ctx, newOrder, req.Items, userID)
	if err != nil {
		s.slog.Error("failed to create order", "hotel_id", hotelID, "error", err)
		return model.Order{}, err
	}

	s.slog.Info("order created", "order_id", created.ID, "hotel_id", hotelID)

	if hydrated, err := s.repo.Get(ctx, created.ID, hotelID, userID); err != nil {
		s.slog.Error("failed to hydrate order for broadcast", "order_id", created.ID, "error", err)
	} else {
		s.broadcastOrder(hydrated, ws.OrderCreated)
	}

	return created, nil
}

func (s *orderService) Get(ctx context.Context, id, hotelID, userID string) (model.Order, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *orderService) GetAll(ctx context.Context, hotelID, userID string, query ListOrdersQuery) (ListOrdersResponse, error) {
	if err := validator.ValidateStruct(&query); err != nil {
		return ListOrdersResponse{}, err
	}
	if err := query.Pagination.Validate(); err != nil {
		return ListOrdersResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.Status, query.Pagination)
	if err != nil {
		return ListOrdersResponse{}, err
	}

	return ListOrdersResponse{
		Orders: list,
		Page:   query.Pagination.Page,
		Limit:  query.Pagination.Limit,
		Total:  total,
	}, nil
}

func (s *orderService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateOrderRequest) (model.Order, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Order{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Order{}, err
	}

	if req.TableID != nil {
		existing.TableID = req.TableID
	}
	if req.RoomID != nil {
		existing.RoomID = req.RoomID
	}
	if req.CabinID != nil {
		existing.CabinID = req.CabinID
	}
	if req.CustomerID != nil {
		existing.CustomerID = req.CustomerID
	}
	if req.Notes != nil {
		existing.Notes = req.Notes
	}

	updated, err := s.repo.Update(ctx, &existing, req.Items, userID)
	if err != nil {
		s.slog.Error("failed to update order", "order_id", id, "error", err)
		return model.Order{}, err
	}

	s.slog.Info("order updated", "order_id", updated.ID)

	if hydrated, err := s.repo.Get(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to hydrate order for broadcast", "order_id", id, "error", err)
	} else {
		s.broadcastOrder(hydrated, ws.OrderUpdated)
	}

	return updated, nil
}

func (s *orderService) UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateOrderStatusRequest) (model.Order, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Order{}, err
	}

	updated, err := s.repo.UpdateStatus(ctx, id, hotelID, userID, req.Status)
	if err != nil {
		s.slog.Error("failed to update order status", "order_id", id, "error", err)
		return model.Order{}, err
	}

	msgType := ws.OrderStatusUpdate
	if req.Status == StatusCancelled {
		msgType = ws.OrderCancelled
	}

	if hydrated, err := s.repo.Get(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to hydrate order for broadcast", "order_id", id, "error", err)
	} else {
		s.broadcastOrder(hydrated, msgType)
	}

	return updated, nil
}

func (s *orderService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete order", "order_id", id, "error", err)
		return err
	}

	s.slog.Info("order deleted", "order_id", id)

	if payload, err := json.Marshal(map[string]string{"id": id}); err != nil {
		s.slog.Error("failed to marshal order delete broadcast", "order_id", id, "error", err)
	} else {
		s.broadcast(hotelID, ws.OrderDeleted, payload)
	}

	return nil
}
