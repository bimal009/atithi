"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { createHotelImage, deleteHotelImage, getHotelImages } from "../api/hotel-images";
import type { CreateHotelImageInput, HotelImage, HotelImageEntityType } from "../types";

export const hotelImageKeys = {
  list: (tenant: string, entityType: HotelImageEntityType, entityId?: string) =>
    ["hotel-images", tenant, entityType, entityId ?? null] as const,
};

export const useHotelImagesQuery = (
  tenant: string,
  entityType: HotelImageEntityType,
  entityId?: string,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: hotelImageKeys.list(tenant, entityType, entityId),
    queryFn: async () => (await getHotelImages(tenant, entityType, entityId)).data.images,
    enabled: options?.enabled,
  });

export const useCreateHotelImage = (
  tenant: string,
  entityType: HotelImageEntityType,
  entityId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHotelImageInput) => createHotelImage(tenant, input),
    onSuccess: (response) => {
      queryClient.setQueryData(
        hotelImageKeys.list(tenant, entityType, entityId),
        (prev: HotelImage[] = []) => [...prev, response.data],
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add that photo"));
    },
  });
};

export const useDeleteHotelImage = (
  tenant: string,
  entityType: HotelImageEntityType,
  entityId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => deleteHotelImage(tenant, imageId),
    onSuccess: (_response, imageId) => {
      queryClient.setQueryData(
        hotelImageKeys.list(tenant, entityType, entityId),
        (prev: HotelImage[] = []) => prev.filter((img) => img.id !== imageId),
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove that photo"));
    },
  });
};
