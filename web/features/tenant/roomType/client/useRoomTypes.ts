"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createRoomType,
  listRoomTypes,
  removeRoomType,
  updateRoomType,
} from "../api/roomType";
import type { CreateRoomTypeInput, UpdateRoomTypeInput } from "../types";

export const roomTypeKeys = {
  all: (tenant: string) => ["roomTypes", tenant] as const,
};

export const useRoomTypesQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...roomTypeKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
    ],
    queryFn: async () => (await listRoomTypes(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateRoomType = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoomTypeInput) => createRoomType(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the room type"));
    },
  });
};

export const useUpdateRoomType = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoomTypeInput }) =>
      updateRoomType(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the room type"));
    },
  });
};

export const useRemoveRoomType = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeRoomType(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the room type"));
    },
  });
};
