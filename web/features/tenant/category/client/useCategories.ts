"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createCategory,
  listCategories,
  removeCategory,
  updateCategory,
} from "../api/category";
import type { CreateCategoryInput, UpdateCategoryInput } from "../types";

export const categoryKeys = {
  all: (tenant: string) => ["categories", tenant] as const,
};

export const useCategoriesQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...categoryKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 20,
    ],
    queryFn: async () => (await listCategories(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateCategory = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the category"));
    },
  });
};

export const useUpdateCategory = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the category"));
    },
  });
};

export const useRemoveCategory = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeCategory(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the category"));
    },
  });
};
