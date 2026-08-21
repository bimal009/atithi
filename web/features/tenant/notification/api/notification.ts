import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { ListNotificationsResponse, Notification } from "../types";

export const listNotifications = async (
  tenant: string,
  params?: { read?: boolean; page?: number; limit?: number },
): Promise<ApiResponse<ListNotificationsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListNotificationsResponse>>(
    `/hotels/slug/${tenant}/notifications`,
    {
      params: {
        read: params?.read,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    },
  );
  return data;
};

export const markNotificationRead = async (
  tenant: string,
  notificationId: string,
): Promise<ApiResponse<Notification>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Notification>>(
    `/hotels/slug/${tenant}/notifications/${notificationId}/read`,
  );
  return data;
};

export const markAllNotificationsRead = async (
  tenant: string,
): Promise<ApiResponse<{ count: number }>> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ count: number }>>(
    `/hotels/slug/${tenant}/notifications/read-all`,
  );
  return data;
};

export const removeNotification = async (
  tenant: string,
  notificationId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/notifications/${notificationId}`,
  );
  return data;
};
