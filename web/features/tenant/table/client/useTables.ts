"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createTable,
  listTables,
  removeTable,
  updateTable,
  updateTableStatus,
} from "../api/table";
import type { CreateTableInput, UpdateTableInput } from "../types";

export const tableKeys = {
  all: (tenant: string) => ["tables", tenant] as const,
};

export const useTablesQuery = (
  tenant: string,
  params?: { search?: string; status?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...tableKeys.all(tenant),
      params?.search ?? "",
      params?.status ?? "",
      params?.page ?? 1,
      params?.limit ?? 12,
    ],
    queryFn: async () => (await listTables(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateTable = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTableInput) => createTable(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the table"));
    },
  });
};

export const useUpdateTable = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTableInput }) =>
      updateTable(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the table"));
    },
  });
};

export const useUpdateTableStatus = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTableStatus(tenant, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all(tenant) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update table status"));
    },
  });
};

export const useRemoveTable = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeTable(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the table"));
    },
  });
};
