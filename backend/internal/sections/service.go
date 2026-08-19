package sections

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
)

type SectionService interface {
	Create(ctx context.Context, hotelID, userID string, req *CreateSectionRequest) (model.Section, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Section, error)
	GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListSectionsResponse, error)
	Update(ctx context.Context, id, hotelID, userID string, req *UpdateSectionRequest) (model.Section, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type sectionService struct {
	slog *slog.Logger
	repo SectionRepo
}

func NewSectionService(slog *slog.Logger, repo SectionRepo) SectionService {
	return &sectionService{slog: slog, repo: repo}
}

func (s *sectionService) Create(ctx context.Context, hotelID, userID string, req *CreateSectionRequest) (model.Section, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Section{}, err
	}

	newSection := &model.Section{
		ID:      uuid.NewString(),
		HotelID: hotelID,
		Name:    req.Name,
	}

	created, err := s.repo.Create(ctx, newSection, userID)
	if err != nil {
		s.slog.Error("failed to create section", "hotel_id", hotelID, "error", err)
		return model.Section{}, err
	}

	s.slog.Info("section created", "section_id", created.ID, "hotel_id", hotelID)

	return created, nil
}

func (s *sectionService) Get(ctx context.Context, id, hotelID, userID string) (model.Section, error) {
	return s.repo.Get(ctx, id, hotelID, userID)
}

func (s *sectionService) GetAll(ctx context.Context, hotelID, userID string, pagination model.Pagination) (ListSectionsResponse, error) {
	if err := pagination.Validate(); err != nil {
		return ListSectionsResponse{}, err
	}

	list, total, err := s.repo.ListForHotel(ctx, hotelID, userID, pagination)
	if err != nil {
		return ListSectionsResponse{}, err
	}

	return ListSectionsResponse{
		Sections: list,
		Page:     pagination.Page,
		Limit:    pagination.Limit,
		Total:    total,
	}, nil
}

func (s *sectionService) Update(ctx context.Context, id, hotelID, userID string, req *UpdateSectionRequest) (model.Section, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.Section{}, err
	}

	existing, err := s.repo.Get(ctx, id, hotelID, userID)
	if err != nil {
		return model.Section{}, err
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}

	updated, err := s.repo.Update(ctx, &existing, userID)
	if err != nil {
		s.slog.Error("failed to update section", "section_id", id, "error", err)
		return model.Section{}, err
	}

	s.slog.Info("section updated", "section_id", updated.ID)

	return updated, nil
}

func (s *sectionService) Delete(ctx context.Context, id, hotelID, userID string) error {
	if err := s.repo.Delete(ctx, id, hotelID, userID); err != nil {
		s.slog.Error("failed to delete section", "section_id", id, "error", err)
		return err
	}

	s.slog.Info("section deleted", "section_id", id)

	return nil
}
