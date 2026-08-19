"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createAddOn,
  listAddOns,
  removeAddOn,
  updateAddOn,
} from "../api/addOn";
import type { CreateAddOnInput, UpdateAddOnInput } from "../types";

export const addOnKeys = {
  all: (tenant: string) => ["addOns", tenant] as const,
};

export const useAddOnsQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...addOnKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 12,
    ],
    queryFn: async () => (await listAddOns(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateAddOn = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAddOnInput) => createAddOn(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: addOnKeys.all(tenant) });
      toast.success(`${response.data.name} added`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the add-on"));
    },
  });
};

export const useUpdateAddOn = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAddOnInput }) =>
      updateAddOn(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: addOnKeys.all(tenant) });
      toast.success(`${response.data.name} updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the add-on"));
    },
  });
};

export const useRemoveAddOn = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeAddOn(tenant, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addOnKeys.all(tenant) });
      toast.success("Add-on removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the add-on"));
    },
  });
};
