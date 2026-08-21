"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { getHotelSettings, updateHotelSettings } from "../api/hotelSettings";
import type { UpdateHotelSettingsInput } from "../types";

export const hotelSettingsKeys = {
  detail: (tenant: string) => ["hotel-settings", tenant] as const,
};

export const useHotelSettingsQuery = (tenant: string) =>
  useQuery({
    queryKey: hotelSettingsKeys.detail(tenant),
    queryFn: async () => (await getHotelSettings(tenant)).data,
  });

export const useUpdateHotelSettings = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHotelSettingsInput) => updateHotelSettings(tenant, input),
    onSuccess: (response) => {
      queryClient.setQueryData(hotelSettingsKeys.detail(tenant), response.data);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update billing settings"));
    },
  });
};
