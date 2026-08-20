package reservations

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

func dedupe(ids []string) []string {
	seen := make(map[string]struct{}, len(ids))
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}

type ReservationService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateReservationRequest) (model.Reservation, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Reservation, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListReservationsQuery) (ListReservationsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateReservationRequest) (model.Reservation, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateReservationStatusRequest) (model.Reservation, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type reservationService struct {
	slog *slog.Logger
	repo ReservationRepo
}

func NewReservationService(slog *slog.Logger, repo ReservationRepo) ReservationService {
	return &reservationService{slog: slog, repo: repo}
}

func (s *reservationService) Create(ctx context.Context, hotelID, userID string, req *CreateReservationRequest) (model.Reservation, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Reservation{}, err
	}

	newReservation := &model.Reservation{
		ID:         uuid.NewString(),
		HotelID:    hotelID,
		GuestName:  req.GuestName,
		GuestPhone: req.GuestPhone,
		PartySize:  req.PartySize,
		ReservedAt: req.ReservedAt,
		Status:     StatusConfirmed,
		Notes:      req.Notes,
	}

	created, err := s.repo.Create(ctx, newReservation, dedupe(req.TableIDs), dedupe(req.CabinIDs), userID)
	if err != nil {
		s.slog.Error("failed to create reservation", "hotel_id", hotelID, "error", err)
		return model.Reservation{}, err
	}

	s.slog.Info("reservation created", "reservation_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *reservationService) Get(ctx context.Context, id, hotelID, userID string) (model.Reservation, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *reservationService) GetAll(ctx context.Context, hotelID, userID string, query ListReservationsQuery) (ListReservationsResponse, error) {
	if err := validator.ValidateStruct(&query); err != nil {
		return ListReservationsResponse{}, err
	}
	if err := query.Pagination.Validate(); err != nil {
		return ListReservationsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.Status, query.Pagination)
	if err != nil {
		return ListReservationsResponse{}, err
	}

	return ListReservationsResponse{
		Reservations: list,
		Page:         query.Pagination.Page,
		Limit:        query.Pagination.Limit,
		Total:        total,
	}, nil
}

func (s *reservationService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateReservationRequest) (model.Reservation, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Reservation{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Reservation{}, err
	}

	finalTableCount := len(existing.Tables)
	if req.TableIDs != nil {
		finalTableCount = len(dedupe(*req.TableIDs))
	}
	finalCabinCount := len(existing.Cabins)
	if req.CabinIDs != nil {
		finalCabinCount = len(dedupe(*req.CabinIDs))
	}
	if finalTableCount+finalCabinCount == 0 {
		return model.Reservation{}, apperr.ErrReservationResourceRequired
	}

	if req.GuestName != nil {
		existing.GuestName = *req.GuestName
	}
	if req.GuestPhone != nil {
		existing.GuestPhone = *req.GuestPhone
	}
	if req.PartySize != nil {
		existing.PartySize = *req.PartySize
	}
	if req.ReservedAt != nil {
		existing.ReservedAt = *req.ReservedAt
	}
	if req.Notes != nil {
		existing.Notes = req.Notes
	}

	var tableIDs, cabinIDs *[]string
	if req.TableIDs != nil {
		deduped := dedupe(*req.TableIDs)
		tableIDs = &deduped
	}
	if req.CabinIDs != nil {
		deduped := dedupe(*req.CabinIDs)
		cabinIDs = &deduped
	}

	updated, err := s.repo.Update(ctx, &existing, tableIDs, cabinIDs, userID)
	if err != nil {
		s.slog.Error("failed to update reservation", "reservation_id", id, "error", err)
		return model.Reservation{}, err
	}

	s.slog.Info("reservation updated", "reservation_id", updated.ID)

	return updated, nil
}

func (s *reservationService) UpdateStatus(ctx context.Context, id, hotelID, userID string, req *UpdateReservationStatusRequest) (model.Reservation, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Reservation{}, err
	}

	updated, err := s.repo.UpdateStatus(ctx, id, hotelID, userID, req.Status)
	if err != nil {
		s.slog.Error("failed to update reservation status", "reservation_id", id, "error", err)
		return model.Reservation{}, err
	}

	return updated, nil
}

func (s *reservationService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete reservation", "reservation_id", id, "error", err)
		return err
	}

	s.slog.Info("reservation deleted", "reservation_id", id)

	return nil
}
