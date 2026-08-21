"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/features/auth/constants";

import { notificationKeys } from "./useNotifications";

export function useNotificationSocket(tenant: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const url = new URL(`${API_URL}/hotels/slug/${tenant}/ws`);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      const envelope = JSON.parse(event.data);
      if (envelope.type !== "notification") return;

      queryClient.setQueryData<number>(notificationKeys.unreadCount(tenant), (count) =>
        (count ?? 0) + 1,
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.all(tenant) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(tenant) });
    };

    return () => socket.close();
  }, [tenant, queryClient]);
}
