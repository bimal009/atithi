"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { getHotelWebsite, updateHotelWebsite } from "../api/hotelWebsite";
import type { UpdateHotelWebsiteInput } from "../types";

export const hotelWebsiteKeys = {
  detail: (tenant: string) => ["hotel-website", tenant] as const,
};

export const useHotelWebsiteQuery = (tenant: string) =>
  useQuery({
    queryKey: hotelWebsiteKeys.detail(tenant),
    queryFn: async () => (await getHotelWebsite(tenant)).data,
  });

export const useUpdateHotelWebsite = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHotelWebsiteInput) => updateHotelWebsite(tenant, input),
    onSuccess: (response) => {
      queryClient.setQueryData(hotelWebsiteKeys.detail(tenant), response.data);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not save your website"));
    },
  });
};
