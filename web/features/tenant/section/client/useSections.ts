"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createSection,
  listSections,
  removeSection,
  updateSection,
} from "../api/section";
import type { CreateSectionInput, UpdateSectionInput } from "../types";

export const sectionKeys = {
  all: (tenant: string) => ["sections", tenant] as const,
};

export const useSectionsQuery = (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...sectionKeys.all(tenant),
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
    ],
    queryFn: async () => (await listSections(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateSection = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSectionInput) => createSection(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the section"));
    },
  });
};

export const useUpdateSection = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSectionInput }) =>
      updateSection(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the section"));
    },
  });
};

export const useRemoveSection = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeSection(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the section"));
    },
  });
};
