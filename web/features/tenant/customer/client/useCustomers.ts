"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createCustomer,
  listCustomers,
  removeCustomer,
  updateCustomer,
} from "../api/customer";
import type { CreateCustomerInput, UpdateCustomerInput } from "../types";

export const customerKeys = {
  all: (tenant: string) => ["customers", tenant] as const,
};

export const useCustomersQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...customerKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
    ],
    queryFn: async () => (await listCustomers(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateCustomer = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the customer"));
    },
  });
};

export const useUpdateCustomer = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      updateCustomer(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the customer"));
    },
  });
};

export const useRemoveCustomer = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeCustomer(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the customer"));
    },
  });
};
