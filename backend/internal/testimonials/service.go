package testimonials

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type TestimonialService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateTestimonialRequest) (model.Testimonial, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Testimonial, error)
	GetAll(ctx context.Context, hotelID, userID string, query ListTestimonialsQuery) (ListTestimonialsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateTestimonialRequest) (model.Testimonial, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type testimonialService struct {
	slog *slog.Logger
	repo TestimonialRepo
}

func NewTestimonialService(slog *slog.Logger, repo TestimonialRepo) TestimonialService {
	return &testimonialService{slog: slog, repo: repo}
}

func (s *testimonialService) Create(ctx context.Context, hotelID, userID string, req *CreateTestimonialRequest) (model.Testimonial, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Testimonial{}, err
	}

	newTestimonial := &model.Testimonial{
		ID:        uuid.NewString(),
		HotelID:   hotelID,
		GuestName: req.GuestName,
		StayLabel: req.StayLabel,
		Quote:     req.Quote,
		Rating:    req.Rating,
	}

	created, err := s.repo.Create(ctx, newTestimonial, userID)
	if err != nil {
		s.slog.Error("failed to create testimonial", "hotel_id", hotelID, "error", err)
		return model.Testimonial{}, err
	}

	s.slog.Info("testimonial created", "testimonial_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *testimonialService) Get(ctx context.Context, id, hotelID, userID string) (model.Testimonial, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *testimonialService) GetAll(ctx context.Context, hotelID, userID string, query ListTestimonialsQuery) (ListTestimonialsResponse, error) {
	if err := query.Pagination.Validate(); err != nil {
		return ListTestimonialsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, query.Pagination)
	if err != nil {
		return ListTestimonialsResponse{}, err
	}

	return ListTestimonialsResponse{
		Testimonials: list,
		Page:         query.Pagination.Page,
		Limit:        query.Pagination.Limit,
		Total:        total,
	}, nil
}

func (s *testimonialService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateTestimonialRequest) (model.Testimonial, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Testimonial{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Testimonial{}, err
	}

	if req.GuestName != nil {
		existing.GuestName = *req.GuestName
	}
	if req.StayLabel != nil {
		existing.StayLabel = req.StayLabel
	}
	if req.Quote != nil {
		existing.Quote = *req.Quote
	}
	if req.Rating != nil {
		existing.Rating = req.Rating
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update testimonial", "testimonial_id", id, "error", err)
		return model.Testimonial{}, err
	}

	s.slog.Info("testimonial updated", "testimonial_id", updated.ID)

	return updated, nil
}

func (s *testimonialService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete testimonial", "testimonial_id", id, "error", err)
		return err
	}

	s.slog.Info("testimonial deleted", "testimonial_id", id)

	return nil
}
