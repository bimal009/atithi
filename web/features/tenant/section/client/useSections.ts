"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useSectionsQuery = (tenant: string) =>
  useQuery({
    queryKey: sectionKeys.all(tenant),
    queryFn: async () => (await listSections(tenant)).data,
  });

export const useCreateSection = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSectionInput) => createSection(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all(tenant) });
      toast.success(`${response.data.name} added`);
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
      toast.success(`${response.data.name} updated`);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all(tenant) });
      toast.success("Section removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the section"));
    },
  });
};
