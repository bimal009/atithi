export type Testimonial = {
  id: string;
  hotelId: string;
  guestName: string;
  stayLabel?: string;
  quote: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
};

export type ListTestimonialsResponse = {
  testimonials: Testimonial[];
  page: number;
  limit: number;
  total: number;
};
