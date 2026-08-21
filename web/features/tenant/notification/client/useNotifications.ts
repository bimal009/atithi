"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification,
} from "../api/notification";
import type { ListNotificationsResponse } from "../types";

export type NotificationsQueryParams = {
  read?: boolean;
  page?: number;
  limit?: number;
};

export const notificationKeys = {
  all: (tenant: string) => ["notifications", tenant] as const,
  list: (tenant: string, params?: NotificationsQueryParams) =>
    [
      ...notificationKeys.all(tenant),
      "list",
      params?.read ?? "all",
      params?.page ?? 1,
      params?.limit ?? 10,
    ] as const,
  unreadCount: (tenant: string) => ["notifications-unread-count", tenant] as const,
};

export const useNotificationsQuery = (tenant: string, params?: NotificationsQueryParams) =>
  useQuery({
    queryKey: notificationKeys.list(tenant, params),
    queryFn: async () => (await listNotifications(tenant, params)).data,
    placeholderData: keepPreviousData,
  });

export const useUnreadNotificationsCount = (tenant: string) =>
  useQuery({
    queryKey: notificationKeys.unreadCount(tenant),
    queryFn: async () =>
      (await listNotifications(tenant, { read: false, page: 1, limit: 1 })).data.total,
    staleTime: 15_000,
  });

export const useMarkNotificationRead = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(tenant, notificationId),
    onSuccess: (_response, notificationId) => {
      queryClient.setQueriesData<ListNotificationsResponse>(
        { queryKey: notificationKeys.all(tenant) },
        (data) => {
          if (!data) return data;
          const target = data.notifications.find((n) => n.id === notificationId);
          if (!target || target.read) return data;
          return {
            ...data,
            notifications: data.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n,
            ),
          };
        },
      );
      queryClient.setQueryData<number>(notificationKeys.unreadCount(tenant), (count) =>
        count === undefined ? count : Math.max(0, count - 1),
      );
    },
  });
};

export const useMarkAllNotificationsRead = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(tenant),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all(tenant) });
      queryClient.setQueryData(notificationKeys.unreadCount(tenant), 0);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not mark notifications read"));
    },
  });
};

export const useRemoveNotification = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => removeNotification(tenant, notificationId),
    onSuccess: (response, notificationId) => {
      queryClient.setQueriesData<ListNotificationsResponse>(
        { queryKey: notificationKeys.all(tenant) },
        (data) => {
          if (!data) return data;
          if (!data.notifications.some((n) => n.id === notificationId)) return data;
          return {
            ...data,
            notifications: data.notifications.filter((n) => n.id !== notificationId),
            total: Math.max(0, data.total - 1),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the notification"));
    },
  });
};
