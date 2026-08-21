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
    const url = new URL(`${API_URL}/hotels/slug/${tenant}/ws`);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    const socket = new WebSocket(url);
    const queryKey = orderKeys.list(tenant, params);

    socket.onmessage = (event) => {
      const envelope = JSON.parse(event.data);
      const order = envelope.payload as Order;

      queryClient.setQueryData<ListOrdersResponse>(queryKey, (old) => {
        if (!old) return old;

        if (envelope.type === "order.created") {
          if (old.orders.some((o) => o.id === order.id)) return old;
          return { ...old, orders: [order, ...old.orders], total: old.total + 1 };
        }

        if (envelope.type === "order.status_update" || envelope.type === "order.cancelled") {
          return { ...old, orders: old.orders.map((o) => (o.id === order.id ? order : o)) };
        }

        return old;
      });
    };

    return () => socket.close();
  }, [tenant, queryClient, params]);
}
