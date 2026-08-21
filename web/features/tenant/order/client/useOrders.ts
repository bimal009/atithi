"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createOrder,
  getKitchenPendingCount,
  listOrders,
  removeOrder,
  resetKitchenPendingCount,
  updateOrder,
  updateOrderStatus,
} from "../api/order";
import type { CreateOrderInput, ListOrdersResponse, Order, UpdateOrderInput } from "../types";

export type OrdersQueryParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export const orderKeys = {
  all: (tenant: string) => ["orders", tenant] as const,
  list: (tenant: string, params?: OrdersQueryParams) =>
    [
      ...orderKeys.all(tenant),
      params?.search ?? "",
      params?.status ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
    ] as const,
  kitchenPendingCount: (tenant: string) => ["kitchen-pending-count", tenant] as const,
};

export const useKitchenPendingCount = (tenant: string) =>
  useQuery({
    queryKey: orderKeys.kitchenPendingCount(tenant),
    queryFn: async () => (await getKitchenPendingCount(tenant)).data.count,
    staleTime: 15_000,
  });

export const useResetKitchenPendingCount = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetKitchenPendingCount(tenant),
    onSuccess: () => {
      queryClient.setQueryData(orderKeys.kitchenPendingCount(tenant), 0);
    },
  });
};

export const useOrdersQuery = (tenant: string, params?: OrdersQueryParams) =>
  useQuery({
    queryKey: orderKeys.list(tenant, params),
    queryFn: async () => (await listOrders(tenant, params)).data,
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
    onSuccess: (response, { id, status }) => {
      queryClient.setQueriesData<ListOrdersResponse>(
        { queryKey: orderKeys.all(tenant) },
        (data) =>
          data && {
            ...data,
            orders: data.orders.map((o) =>
              o.id === id ? { ...o, status: status as Order["status"] } : o
            ),
          }
      );
      queryClient.invalidateQueries({
        queryKey: orderKeys.all(tenant),
        predicate: (query) => query.queryKey[5] === 1,
      });
      toast.success(response.message);
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
