package customer

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"testing"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
)

type fakeCustomerRepo struct {
	customers map[string]model.Customer
	createErr error
	updateErr error
}

func newFakeCustomerRepo() *fakeCustomerRepo {
	return &fakeCustomerRepo{customers: map[string]model.Customer{}}
}

func (f *fakeCustomerRepo) Create(ctx context.Context, c *model.Customer) (model.Customer, error) {
	if f.createErr != nil {
		return model.Customer{}, f.createErr
	}
	c.ID = "new-id"
	f.customers[c.ID] = *c
	return *c, nil
}

func (f *fakeCustomerRepo) Get(ctx context.Context, id, hotelID string) (model.Customer, error) {
	c, ok := f.customers[id]
	if !ok || c.HotelID != hotelID {
		return model.Customer{}, apperr.ErrCustomerNotFound
	}
	return c, nil
}

func (f *fakeCustomerRepo) ListForHotel(ctx context.Context, hotelID string, pagination model.Pagination) ([]model.Customer, int, error) {
	customers := make([]model.Customer, 0)
	for _, c := range f.customers {
		if c.HotelID == hotelID {
			customers = append(customers, c)
		}
	}
	return customers, len(customers), nil
}

func (f *fakeCustomerRepo) Update(ctx context.Context, c *model.Customer) (model.Customer, error) {
	if f.updateErr != nil {
		return model.Customer{}, f.updateErr
	}
	f.customers[c.ID] = *c
	return *c, nil
}

func (f *fakeCustomerRepo) Delete(ctx context.Context, id, hotelID string) error {
	c, ok := f.customers[id]
	if !ok || c.HotelID != hotelID {
		return apperr.ErrCustomerNotFound
	}
	delete(f.customers, id)
	return nil
}

func newTestService(repo CustomerRepo) CustomerService {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	return NewCustomerService(logger, repo)
}

func strPtr(s string) *string { return &s }

func TestCreate_RejectsDocumentTypeWithoutNumber(t *testing.T) {
	svc := newTestService(newFakeCustomerRepo())

	_, err := svc.Create(context.Background(), "hotel-1", &CreateCustomerRequest{
		Name:         "Sujata Shrestha",
		Phone:        "9812345678",
		DocumentType: strPtr(DocumentTypeCitizenship),
	})

	if !errors.Is(err, apperr.ErrDocumentMismatch) {
		t.Fatalf("expected ErrDocumentMismatch, got %v", err)
	}
}

func TestCreate_RejectsDocumentNumberWithoutType(t *testing.T) {
	svc := newTestService(newFakeCustomerRepo())

	_, err := svc.Create(context.Background(), "hotel-1", &CreateCustomerRequest{
		Name:           "Sujata Shrestha",
		Phone:          "9812345678",
		DocumentNumber: strPtr("123-456"),
	})

	if !errors.Is(err, apperr.ErrDocumentMismatch) {
		t.Fatalf("expected ErrDocumentMismatch, got %v", err)
	}
}

func TestCreate_AllowsBothDocumentFieldsTogether(t *testing.T) {
	svc := newTestService(newFakeCustomerRepo())

	created, err := svc.Create(context.Background(), "hotel-1", &CreateCustomerRequest{
		Name:           "Sujata Shrestha",
		Phone:          "9812345678",
		DocumentType:   strPtr(DocumentTypeCitizenship),
		DocumentNumber: strPtr("123-456"),
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.HotelID != "hotel-1" || created.Name != "Sujata Shrestha" {
		t.Fatalf("unexpected customer returned: %+v", created)
	}
}

func TestCreate_AllowsNeitherDocumentField(t *testing.T) {
	svc := newTestService(newFakeCustomerRepo())

	_, err := svc.Create(context.Background(), "hotel-1", &CreateCustomerRequest{
		Name:  "Sujata Shrestha",
		Phone: "9812345678",
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestCreate_ValidatesRequiredFields(t *testing.T) {
	svc := newTestService(newFakeCustomerRepo())

	_, err := svc.Create(context.Background(), "hotel-1", &CreateCustomerRequest{
		Name:  "S",
		Phone: "123",
	})

	if err == nil {
		t.Fatal("expected a validation error for a too-short name and phone")
	}
}

func TestUpdate_RejectsSettingOnlyDocumentNumber(t *testing.T) {
	repo := newFakeCustomerRepo()
	repo.customers["c1"] = model.Customer{
		ID: "c1", HotelID: "hotel-1", Name: "Guest", Phone: "9812345678",
	}
	svc := newTestService(repo)

	_, err := svc.Update(context.Background(), "c1", "hotel-1", &UpdateCustomerRequest{
		DocumentNumber: strPtr("123-456"),
	})

	if !errors.Is(err, apperr.ErrDocumentMismatch) {
		t.Fatalf("expected ErrDocumentMismatch when only documentNumber is set, got %v", err)
	}
}

func TestList_ReturnsTotal(t *testing.T) {
	repo := newFakeCustomerRepo()
	repo.customers["c1"] = model.Customer{ID: "c1", HotelID: "hotel-1", Name: "A", Phone: "9800000001"}
	repo.customers["c2"] = model.Customer{ID: "c2", HotelID: "hotel-1", Name: "B", Phone: "9800000002"}
	svc := newTestService(repo)

	resp, err := svc.List(context.Background(), "hotel-1", model.Pagination{Page: 1, Limit: 20})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.Total != 2 || len(resp.Customers) != 2 {
		t.Fatalf("expected 2 customers with total=2, got total=%d len=%d", resp.Total, len(resp.Customers))
	}
}

func TestDelete_NotFoundForWrongHotel(t *testing.T) {
	repo := newFakeCustomerRepo()
	repo.customers["c1"] = model.Customer{ID: "c1", HotelID: "hotel-1", Name: "A", Phone: "9800000001"}
	svc := newTestService(repo)

	err := svc.Delete(context.Background(), "c1", "hotel-2")

	if !errors.Is(err, apperr.ErrCustomerNotFound) {
		t.Fatalf("expected ErrCustomerNotFound, got %v", err)
	}
}
