"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { checkSlugAvailability, createHotel, deleteHotel, updateHotel } from "../api/hotel";
import { SLUG_REGEX } from "../schema";
import { CreateHotelInput, UpdateHotelInput } from "../types";

export const hotelKeys = {
  all: ["hotels"] as const,
  detail: (id: string) => ["hotels", id] as const,
  slugAvailability: (slug: string) => ["hotels", "slug-availability", slug] as const,
};

// `slug` is expected to already be debounced by the caller (the create-hotel
// dialog derives it from nuqs's own debounced URL sync) — this hook only
// owns the availability request itself.
export const useSlugAvailability = (slug: string, options?: { ignore?: string }) => {
  const trimmed = slug.trim();
  const isCheckable =
    trimmed.length >= 2 && SLUG_REGEX.test(trimmed) && trimmed !== options?.ignore;

  const query = useQuery({
    queryKey: hotelKeys.slugAvailability(trimmed),
    queryFn: ({ signal }) => checkSlugAvailability(trimmed, signal),
    enabled: isCheckable,
    staleTime: 30_000,
    retry: false,
  });

  return {
    checking: isCheckable && query.isFetching,
    available: isCheckable ? query.data : undefined,
  };
};

export const useCreateHotel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHotelInput) => createHotel(input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.all });
      toast.success(`${response.data.name} added`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create the hotel"));
    },
  });
};

export const useUpdateHotel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHotelInput }) =>
      updateHotel(id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.all });
      toast.success(`${response.data.name} updated`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the hotel"));
    },
  });
};

export const useDeleteHotel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.all });
      toast.success("Hotel removed");
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the hotel"));
    },
  });
};
