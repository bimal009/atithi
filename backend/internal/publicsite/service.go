package publicsite

import (
	"context"
	"log/slog"
)

type PublicSiteService interface {
	GetSite(ctx context.Context, slug string) (SiteResponse, error)
}

type publicSiteService struct {
	slog *slog.Logger
	repo PublicSiteRepo
}

func NewPublicSiteService(slog *slog.Logger, repo PublicSiteRepo) PublicSiteService {
	return &publicSiteService{slog: slog, repo: repo}
}

func (s *publicSiteService) GetSite(ctx context.Context, slug string) (SiteResponse, error) {
	hotel, err := s.repo.GetHotelBySlug(ctx, slug)
	if err != nil {
		return SiteResponse{}, err
	}

	website, err := s.repo.GetWebsite(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	roomTypes, err := s.repo.ListRoomTypes(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	cabins, err := s.repo.ListCabins(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	tables, err := s.repo.ListTables(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	menuItems, err := s.repo.ListMenuItems(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	galleryImages, err := s.repo.ListGalleryImages(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	testimonials, err := s.repo.ListTestimonials(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	currency, mapURL, aboutUs, amenities, err := s.repo.GetSettings(ctx, hotel.ID)
	if err != nil {
		return SiteResponse{}, err
	}

	return SiteResponse{
		Hotel:         hotel,
		Website:       website,
		RoomTypes:     roomTypes,
		Cabins:        cabins,
		Tables:        tables,
		MenuItems:     menuItems,
		GalleryImages: galleryImages,
		Testimonials:  testimonials,
		Currency:      currency,
		MapURL:        mapURL,
		AboutUs:       aboutUs,
		Amenities:     amenities,
	}, nil
}
