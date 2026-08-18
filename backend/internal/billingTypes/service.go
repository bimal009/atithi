package billingtypes

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type BillingTypeService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateBillingTypeRequest) (model.BillingType, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.BillingType, error)
	GetAll(ctx context.Context, hotelID, userID string) ([]model.BillingType, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateBillingTypeRequest) (model.BillingType, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type billingTypeService struct {
	slog *slog.Logger
	repo BillingTypeRepo
}

func NewBillingTypeService(slog *slog.Logger, repo BillingTypeRepo) BillingTypeService {
	return &billingTypeService{slog: slog, repo: repo}
}

func (s *billingTypeService) Create(ctx context.Context, hotelID, userID string, req *CreateBillingTypeRequest) (model.BillingType, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.BillingType{}, err
	}

	newBillingType := &model.BillingType{
		ID:      uuid.NewString(),
		HotelID: hotelID,
		Name:    req.Name,
	}

	created, err := s.repo.Create(ctx, newBillingType, userID)
	if err != nil {
		s.slog.Error("failed to create billing type", "hotel_id", hotelID, "error", err)
		return model.BillingType{}, err
	}

	s.slog.Info("billing type created", "billing_type_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *billingTypeService) Get(ctx context.Context, id, hotelID, userID string) (model.BillingType, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *billingTypeService) GetAll(ctx context.Context, hotelID, userID string) ([]model.BillingType, error) {
	return s.repo.ListForHotel(ctx, hotelID, userID)
}

func (s *billingTypeService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateBillingTypeRequest) (model.BillingType, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.BillingType{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.BillingType{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update billing type", "billing_type_id", id, "error", err)
		return model.BillingType{}, err
	}

	s.slog.Info("billing type updated", "billing_type_id", updated.ID)

	return updated, nil
}

func (s *billingTypeService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete billing type", "billing_type_id", id, "error", err)
		return err
	}

	s.slog.Info("billing type deleted", "billing_type_id", id)

	return nil
}
