package tables

import (
	"context"
	"fmt"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type TableService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateTableRequest) (model.Table, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Table, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListTablesQuery) (ListTablesResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateTableRequest) (model.Table, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateTableStatusRequest) (model.Table, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type tableService struct {
	slog     *slog.Logger
	repo     TableRepo
	notifier notifications.Notifier
}

func NewTableService(slog *slog.Logger, repo TableRepo, notifier notifications.Notifier) TableService {
	return &tableService{slog: slog, repo: repo, notifier: notifier}
}

func (s *tableService) Create(ctx context.Context, hotelID, userID string, req *CreateTableRequest) (model.Table, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Table{}, err
	}

	newTable := &model.Table{
		ID:        uuid.NewString(),
		HotelID:   hotelID,
		Name:      req.Name,
		Capacity:  req.Capacity,
		SectionID: req.SectionID,
		Status:    StatusAvailable,
	}

	created, err := s.repo.Create(ctx, newTable, userID)
	if err != nil {
		s.slog.Error("failed to create table", "hotel_id", hotelID, "error", err)
		return model.Table{}, err
	}

	s.slog.Info("table created", "table_id", created.ID, "hotel_id", hotelID)

	s.notifier.Notify(ctx, hotelID, model.NotifTableCreated, fmt.Sprintf("Table '%s' added", created.Name), nil)

	return created, nil
}

func (s *tableService) Get(ctx context.Context, id, hotelID, userID string) (model.Table, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *tableService) GetAll(ctx context.Context, hotelID, userID string, query ListTablesQuery) (ListTablesResponse, error) {
	if err := validator.ValidateStruct(&query); err != nil {
		return ListTablesResponse{}, err
	}
	if err := query.Pagination.Validate(); err != nil {
		return ListTablesResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.Status, query.Pagination)
	if err != nil {
		return ListTablesResponse{}, err
	}

	return ListTablesResponse{
		Tables: list,
		Page:   query.Pagination.Page,
		Limit:  query.Pagination.Limit,
		Total:  total,
	}, nil
}

func (s *tableService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateTableRequest) (model.Table, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Table{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Table{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Capacity != nil {
		existing.Capacity = *req.Capacity
	}
	if req.SectionID != nil {
		existing.SectionID = *req.SectionID
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update table", "table_id", id, "error", err)
		return model.Table{}, err
	}

	s.slog.Info("table updated", "table_id", updated.ID)

	s.notifier.Notify(ctx, hotelID, model.NotifTableUpdated, fmt.Sprintf("Table '%s' updated", updated.Name), nil)

	return updated, nil
}

func (s *tableService) UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateTableStatusRequest) (model.Table, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Table{}, err
	}

	updated, err := s.repo.UpdateStatus(ctx, id, hotelID, userID, req.Status)
	if err != nil {
		s.slog.Error("failed to update table status", "table_id", id, "error", err)
		return model.Table{}, err
	}

	s.notifier.Notify(ctx, hotelID, model.NotifTableUpdated, fmt.Sprintf("Table '%s' marked %s", updated.Name, updated.Status), nil)

	return updated, nil
}

func (s *tableService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete table", "table_id", id, "error", err)
		return err
	}

	s.slog.Info("table deleted", "table_id", id)

	s.notifier.Notify(ctx, hotelID, model.NotifTableDeleted, "Table removed", nil)

	return nil
}
