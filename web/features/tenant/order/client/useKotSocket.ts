"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/features/auth/constants";

import { orderKeys, type OrdersQueryParams } from "./useOrders";
import type { ListOrdersResponse, Order } from "../types";

/** `params` must match the params passed to the `useOrdersQuery` this is meant to keep live. */
export function useKotSocket(tenant: string, params?: OrdersQueryParams) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const queryKey = orderKeys.list(tenant, params);
    let socket: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let stopped = false;

    function connect() {
      const url = new URL(`${API_URL}/hotels/slug/${tenant}/ws`);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

      socket = new WebSocket(url);

      socket.onmessage = (event) => {
        const envelope = JSON.parse(event.data);

        queryClient.setQueryData<ListOrdersResponse>(queryKey, (old) => {
          if (!old) return old;

          if (envelope.type === "order.created") {
            const order = envelope.payload as Order;
            if (old.orders.some((o) => o.id === order.id)) return old;
            return { ...old, orders: [order, ...old.orders], total: old.total + 1 };
          }

          if (
            envelope.type === "order.updated" ||
            envelope.type === "order.status_update" ||
            envelope.type === "order.cancelled"
          ) {
            const order = envelope.payload as Order;
            return { ...old, orders: old.orders.map((o) => (o.id === order.id ? order : o)) };
          }

          if (envelope.type === "order.deleted") {
            const { id } = envelope.payload as { id: string };
            if (!old.orders.some((o) => o.id === id)) return old;
            return {
              ...old,
              orders: old.orders.filter((o) => o.id !== id),
              total: Math.max(0, old.total - 1),
            };
          }

          return old;
        });
      };

      socket.onclose = () => {
        if (stopped) return;
        reconnectTimer = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      socket.close();
    };
  }, [tenant, queryClient, params]);
}
