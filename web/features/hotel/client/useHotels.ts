"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { createHotel, deleteHotel, updateHotel } from "../api/hotel";
import { CreateHotelInput, UpdateHotelInput } from "../types";

export const hotelKeys = {
  all: ["hotels"] as const,
  detail: (id: string) => ["hotels", id] as const,
};

export const useCreateHotel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHotelInput) => createHotel(input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.all });
      toast.success(`${response.data.name} added`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create the hotel"));
    },
  });
};

export const useUpdateHotel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHotelInput }) =>
      updateHotel(id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.all });
      toast.success(`${response.data.name} updated`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the hotel"));
    },
  });
};

export const useDeleteHotel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.all });
      toast.success("Hotel removed");
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the hotel"));
    },
  });
};
