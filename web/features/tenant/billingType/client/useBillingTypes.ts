"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createBillingType,
  listBillingTypes,
  removeBillingType,
  updateBillingType,
} from "../api/billingType";
import type { CreateBillingTypeInput, UpdateBillingTypeInput } from "../types";

export const billingTypeKeys = {
  all: (tenant: string) => ["billingTypes", tenant] as const,
};

export const useBillingTypesQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...billingTypeKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 20,
    ],
    queryFn: async () => (await listBillingTypes(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateBillingType = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBillingTypeInput) => createBillingType(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: billingTypeKeys.all(tenant) });
      toast.success(`${response.data.name} added`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the billing type"));
    },
  });
};

export const useUpdateBillingType = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBillingTypeInput }) =>
      updateBillingType(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: billingTypeKeys.all(tenant) });
      toast.success(`${response.data.name} updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the billing type"));
    },
  });
};

export const useRemoveBillingType = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeBillingType(tenant, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingTypeKeys.all(tenant) });
      toast.success("Billing type removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the billing type"));
    },
  });
};
