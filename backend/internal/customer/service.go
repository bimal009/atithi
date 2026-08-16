package customer

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
)

type CustomerService interface {
	Create(ctx context.Context, hotelID string, req *CreateCustomerRequest) (model.Customer, error)
	Get(ctx context.Context, id, hotelID string) (model.Customer, error)
	List(ctx context.Context, hotelID string, pagination model.Pagination) (ListCustomersResponse, error)
	Update(ctx context.Context, id, hotelID string, req *UpdateCustomerRequest) (model.Customer, error)
	Delete(ctx context.Context, id, hotelID string) error
}

type customerService struct {
	slog *slog.Logger
	repo CustomerRepo
}

func NewCustomerService(slog *slog.Logger, repo CustomerRepo) CustomerService {
	return &customerService{
		slog: slog,
		repo: repo,
	}
}

func (s *customerService) Create(ctx context.Context, hotelID string, req *CreateCustomerRequest) (model.Customer, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Customer{}, err
	}
	if (req.DocumentType == nil) != (req.DocumentNumber == nil) {
		return model.Customer{}, apperr.ErrDocumentMismatch
	}

	newCustomer := &model.Customer{
		HotelID:        hotelID,
		Name:           req.Name,
		Phone:          req.Phone,
		Email:          req.Email,
		Notes:          req.Notes,
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
	}

	created, err := s.repo.Create(ctx, newCustomer)
	if err != nil {
		s.slog.Error("failed to create customer", "hotel_id", hotelID, "error", err)
		return model.Customer{}, err
	}

	s.slog.Info("customer created", "customer_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *customerService) Get(ctx context.Context, id, hotelID string) (model.Customer, error) {
	return s.repo.Get(ctx, id, hotelID)
}

func (s *customerService) List(ctx context.Context, hotelID string, pagination model.Pagination) (ListCustomersResponse, error) {
	if err := pagination.Validate(); err != nil {
		return ListCustomersResponse{}, err
	}

	customers, total, err := s.repo.ListForHotel(ctx, hotelID, pagination)
	if err != nil {
		return ListCustomersResponse{}, err
	}

	return ListCustomersResponse{
		Customers: customers,
		Page:      pagination.Page,
		Limit:     pagination.Limit,
		Total:     total,
	}, nil
}

func (s *customerService) Update(ctx context.Context, id, hotelID string, req *UpdateCustomerRequest) (model.Customer, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Customer{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID)
	if err != nil {
		return model.Customer{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Phone != nil {
		existing.Phone = *req.Phone
	}
	if req.Email != nil {
		existing.Email = req.Email
	}
	if req.Notes != nil {
		existing.Notes = req.Notes
	}
	if req.DocumentType != nil {
		existing.DocumentType = req.DocumentType
	}
	if req.DocumentNumber != nil {
		existing.DocumentNumber = req.DocumentNumber
	}

	if (existing.DocumentType == nil) != (existing.DocumentNumber == nil) {
		return model.Customer{}, apperr.ErrDocumentMismatch
	}

	updated, err := s.repo.Update(ctx, &existing)
	if err != nil {
		s.slog.Error("failed to update customer", "customer_id", id, "error", err)
		return model.Customer{}, err
	}

	s.slog.Info("customer updated", "customer_id", updated.ID)

	return updated, nil
}

func (s *customerService) Delete(ctx context.Context, id, hotelID string) error {
	if err := s.repo.Delete(ctx, id, hotelID); err != nil {
		s.slog.Error("failed to delete customer", "customer_id", id, "error", err)
		return err
	}

	s.slog.Info("customer deleted", "customer_id", id)

	return nil
}
