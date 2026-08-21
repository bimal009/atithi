"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createOrder,
  listOrders,
  removeOrder,
  updateOrder,
  updateOrderStatus,
} from "../api/order";
import type { CreateOrderInput, UpdateOrderInput } from "../types";

export const orderKeys = {
  all: (tenant: string) => ["orders", tenant] as const,
};

export const useOrdersQuery = (tenant: string, status?: string) =>
  useQuery({
    queryKey: [...orderKeys.all(tenant), status ?? ""],
    queryFn: async () => (await listOrders(tenant, status)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateOrder = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create the order"));
    },
  });
};

export const useUpdateOrder = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrderInput }) =>
      updateOrder(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the order"));
    },
  });
};

export const useUpdateOrderStatus = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(tenant, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all(tenant) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update order status"));
    },
  });
};

export const useRemoveOrder = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeOrder(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the order"));
    },
  });
};
