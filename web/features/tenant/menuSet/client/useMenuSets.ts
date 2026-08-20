"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createMenuSet,
  listMenuSets,
  removeMenuSet,
  updateMenuSet,
} from "../api/menuSet";
import type { CreateMenuSetInput, UpdateMenuSetInput } from "../types";

export const menuSetKeys = {
  all: (tenant: string) => ["menuSets", tenant] as const,
};

export const useMenuSetsQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...menuSetKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 12,
    ],
    queryFn: async () => (await listMenuSets(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateMenuSet = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMenuSetInput) => createMenuSet(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: menuSetKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the menu set"));
    },
  });
};

export const useUpdateMenuSet = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMenuSetInput }) =>
      updateMenuSet(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: menuSetKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the menu set"));
    },
  });
};

export const useRemoveMenuSet = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeMenuSet(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: menuSetKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the menu set"));
    },
  });
};
