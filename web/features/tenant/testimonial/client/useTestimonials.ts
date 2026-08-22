"use client";

import { useQuery } from "@tanstack/react-query";

import { listTestimonials } from "../api/testimonial";

export const testimonialKeys = {
  all: (tenant: string) => ["testimonials", tenant] as const,
};

export const useTestimonialsQuery = (
  tenant: string,
  params?: { page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [...testimonialKeys.all(tenant), params?.page ?? 1, params?.limit ?? 20],
    queryFn: async () => (await listTestimonials(tenant, params)).data,
  });
