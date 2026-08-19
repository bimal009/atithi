"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useCategoriesQuery = (tenant: string) =>
  useQuery({
    queryKey: categoryKeys.all(tenant),
    queryFn: async () => (await listCategories(tenant)).data,
  });

export const useCreateCategory = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(tenant) });
      toast.success(`${response.data.name} added`);
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
      toast.success(`${response.data.name} updated`);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all(tenant) });
      toast.success("Category removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the category"));
    },
  });
};
