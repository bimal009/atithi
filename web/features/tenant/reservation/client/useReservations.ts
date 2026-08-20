"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createReservation,
  listReservations,
  removeReservation,
  updateReservation,
  updateReservationStatus,
} from "../api/reservation";
import type { CreateReservationInput, UpdateReservationInput } from "../types";

export const reservationKeys = {
  all: (tenant: string) => ["reservations", tenant] as const,
};

export const useReservationsQuery = (
  tenant: string,
  params?: { search?: string; status?: string },
) =>
  useQuery({
    queryKey: [...reservationKeys.all(tenant), params?.search ?? "", params?.status ?? ""],
    queryFn: async () => (await listReservations(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useCreateReservation = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReservationInput) => createReservation(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the reservation"));
    },
  });
};

export const useUpdateReservation = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReservationInput }) =>
      updateReservation(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the reservation"));
    },
  });
};

export const useUpdateReservationStatus = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateReservationStatus(tenant, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all(tenant) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update reservation status"));
    },
  });
};

export const useRemoveReservation = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeReservation(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the reservation"));
    },
  });
};
