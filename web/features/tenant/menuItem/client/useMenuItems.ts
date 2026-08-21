"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createMenuItem,
  listMenuItems,
  removeMenuItem,
  searchDishes,
  updateMenuItem,
} from "../api/menuItem";
import type { CreateMenuItemInput, UpdateMenuItemInput } from "../types";

export const menuItemKeys = {
  all: (tenant: string) => ["menuItems", tenant] as const,
};

export const useSearchDishesQuery = (search: string) =>
  useQuery({
    queryKey: ["dishes", "search", search],
    queryFn: async () => (await searchDishes(search)).data,
    enabled: search.trim().length >= 2,
  });

export const useMenuItemsQuery = (
  tenant: string,
  params?: {
    search?: string;
    categoryId?: string;
    foodType?: string;
    page?: number;
    limit?: number;
  },
) =>
  useQuery({
    queryKey: [
      ...menuItemKeys.all(tenant),
      params?.search ?? "",
      params?.categoryId ?? "",
      params?.foodType ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
    ],
    queryFn: async () => (await listMenuItems(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateMenuItem = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMenuItemInput) => createMenuItem(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the dish"));
    },
  });
};

export const useUpdateMenuItem = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMenuItemInput }) =>
      updateMenuItem(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the dish"));
    },
  });
};

export const useRemoveMenuItem = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeMenuItem(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: menuItemKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the dish"));
    },
  });
};
