package orders

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/internal/ws"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

func kitchenPendingKey(hotelID string) string {
	return "kitchen:pending-count:" + hotelID
}

func orderLabel(order model.Order) string {
	switch {
	case order.TableName != nil:
		return "table " + *order.TableName
	case order.RoomNumber != nil:
		return "room " + *order.RoomNumber
	case order.CabinName != nil:
		return "cabin " + *order.CabinName
	default:
		return "order"
	}
}

type OrderService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateOrderRequest) (model.Order, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Order, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListOrdersQuery) (ListOrdersResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateOrderRequest) (model.Order, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateOrderStatusRequest) (model.Order, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
	KitchenPendingCount(ctx context.Context, hotelID string) (int64, error)
	ResetKitchenPendingCount(ctx context.Context, hotelID string) error
}

type orderService struct {
	slog     *slog.Logger
	repo     OrderRepo
	hub      *ws.Hub
	notifier notifications.Notifier
	redis    *redis.Client
}

func NewOrderService(slog *slog.Logger, repo OrderRepo, hub *ws.Hub, notifier notifications.Notifier, redisClient *redis.Client) OrderService {
	return &orderService{slog: slog, repo: repo, hub: hub, notifier: notifier, redis: redisClient}
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
		s.notifier.Notify(ctx, hotelID, model.NotifOrderCreated, fmt.Sprintf("New order for %s", orderLabel(hydrated)), nil)
	}

	if created.Status == StatusPending {
		go func() {
			bgCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
			defer cancel()

			if err := s.redis.Incr(bgCtx, kitchenPendingKey(hotelID)).Err(); err != nil {
				s.slog.Error("failed to increment kitchen pending count", "hotel_id", hotelID, "error", err)
			}
		}()
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
		s.notifier.Notify(ctx, hotelID, model.NotifOrderUpdated, fmt.Sprintf("Order for %s updated", orderLabel(hydrated)), nil)
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

	notifType := model.NotifOrderStatusUpdated
	if req.Status == StatusCancelled {
		notifType = model.NotifOrderCancelled
	}

	if hydrated, err := s.repo.Get(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to hydrate order for broadcast", "order_id", id, "error", err)
	} else {
		s.broadcastOrder(hydrated, msgType)
		s.notifier.Notify(ctx, hotelID, notifType, fmt.Sprintf("Order for %s marked %s", orderLabel(hydrated), req.Status), nil)
	}

	return updated, nil
}

func (s *orderService) KitchenPendingCount(ctx context.Context, hotelID string) (int64, error) {
	count, err := s.redis.Get(ctx, kitchenPendingKey(hotelID)).Int64()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return 0, nil
		}
		return 0, err
	}

	return count, nil
}

func (s *orderService) ResetKitchenPendingCount(ctx context.Context, hotelID string) error {
	return s.redis.Set(ctx, kitchenPendingKey(hotelID), 0, 0).Err()
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

	s.notifier.Notify(ctx, hotelID, model.NotifOrderDeleted, "Order removed", nil)

	return nil
}
