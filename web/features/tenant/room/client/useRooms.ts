"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createRoom,
  listRooms,
  removeRoom,
  updateRoom,
  updateRoomStatus,
} from "../api/room";
import type { CreateRoomInput, UpdateRoomInput } from "../types";

export const roomKeys = {
  all: (tenant: string) => ["rooms", tenant] as const,
};

export const useRoomsQuery = (
  tenant: string,
  params?: { search?: string; status?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...roomKeys.all(tenant),
      params?.search ?? "",
      params?.status ?? "",
      params?.page ?? 1,
      params?.limit ?? 12,
    ],
    queryFn: async () => (await listRooms(tenant, params)).data,
  });

export const useCreateRoom = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoomInput) => createRoom(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(tenant) });
      toast.success(`Room ${response.data.number} added`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the room"));
    },
  });
};

export const useUpdateRoom = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoomInput }) =>
      updateRoom(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(tenant) });
      toast.success(`Room ${response.data.number} updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the room"));
    },
  });
};

export const useUpdateRoomStatus = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateRoomStatus(tenant, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(tenant) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update room status"));
    },
  });
};

export const useRemoveRoom = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeRoom(tenant, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(tenant) });
      toast.success("Room removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the room"));
    },
  });
};
