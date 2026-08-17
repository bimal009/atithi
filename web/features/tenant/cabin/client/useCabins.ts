"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createCabin,
  listCabins,
  removeCabin,
  updateCabin,
  updateCabinStatus,
} from "../api/cabin";
import type { CreateCabinInput, UpdateCabinInput } from "../types";

export const cabinKeys = {
  all: (tenant: string) => ["cabins", tenant] as const,
};

export const useCabinsQuery = (
  tenant: string,
  params?: { search?: string; status?: string },
) =>
  useQuery({
    queryKey: [...cabinKeys.all(tenant), params?.search ?? "", params?.status ?? ""],
    queryFn: async () => (await listCabins(tenant, params)).data,
  });

export const useCreateCabin = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCabinInput) => createCabin(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cabinKeys.all(tenant) });
      toast.success(`Cabin ${response.data.number} added`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the cabin"));
    },
  });
};

export const useUpdateCabin = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCabinInput }) =>
      updateCabin(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cabinKeys.all(tenant) });
      toast.success(`Cabin ${response.data.number} updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the cabin"));
    },
  });
};

export const useUpdateCabinStatus = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateCabinStatus(tenant, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cabinKeys.all(tenant) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update cabin status"));
    },
  });
};

export const useRemoveCabin = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeCabin(tenant, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cabinKeys.all(tenant) });
      toast.success("Cabin removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the cabin"));
    },
  });
};
