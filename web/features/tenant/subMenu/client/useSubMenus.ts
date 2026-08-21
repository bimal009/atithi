"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createSubMenu,
  listSubMenus,
  removeSubMenu,
  updateSubMenu,
} from "../api/subMenu";
import type { CreateSubMenuInput, UpdateSubMenuInput } from "../types";

export const subMenuKeys = {
  all: (tenant: string) => ["subMenus", tenant] as const,
};

export const useSubMenusQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...subMenuKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
    ],
    queryFn: async () => (await listSubMenus(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateSubMenu = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubMenuInput) => createSubMenu(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: subMenuKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the sub-menu"));
    },
  });
};

export const useUpdateSubMenu = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSubMenuInput }) =>
      updateSubMenu(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: subMenuKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the sub-menu"));
    },
  });
};

export const useRemoveSubMenu = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeSubMenu(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: subMenuKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the sub-menu"));
    },
  });
};
