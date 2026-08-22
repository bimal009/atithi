package testimonials

import model "github.com/bimal009/atithi/internal/models"

type CreateTestimonialRequest struct {
	GuestName string  `json:"guestName" validate:"required,min=1,max=100"`
	StayLabel *string `json:"stayLabel,omitempty" validate:"omitempty,max=100"`
	Quote     string  `json:"quote" validate:"required,min=1,max=1000"`
	Rating    *int    `json:"rating,omitempty" validate:"omitempty,gte=1,lte=5"`
}

type UpdateTestimonialRequest struct {
	GuestName *string `json:"guestName,omitempty" validate:"omitempty,min=1,max=100"`
	StayLabel *string `json:"stayLabel,omitempty" validate:"omitempty,max=100"`
	Quote     *string `json:"quote,omitempty" validate:"omitempty,min=1,max=1000"`
	Rating    *int    `json:"rating,omitempty" validate:"omitempty,gte=1,lte=5"`
}

type ListTestimonialsResponse struct {
	Testimonials []model.Testimonial `json:"testimonials"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
	Total        int                 `json:"total"`
}

type ListTestimonialsQuery struct {
	model.Pagination
}
