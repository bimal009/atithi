"use client";

import Link from "next/link";
import { BellIcon, CheckCheckIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
  useUnreadNotificationsCount,
} from "../client/useNotifications";
import { useNotificationSocket } from "../client/useNotificationSocket";
import { NotificationItem } from "./notification-item";

const RECENT_LIMIT = 8;

export function NotificationBell({ tenant }: { tenant: string }) {
  useNotificationSocket(tenant);

  const basePath = `/${tenant}/dashboard`;
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(tenant);
  const { data, isLoading } = useNotificationsQuery(tenant, { page: 1, limit: RECENT_LIMIT });
  const markRead = useMarkNotificationRead(tenant);
  const markAllRead = useMarkAllNotificationsRead(tenant);

  const notifications = data?.notifications ?? [];

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon-sm" className="relative" />}>
        <BellIcon />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px] tabular-nums">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheckIcon data-icon="inline-start" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          <div className="flex flex-col gap-0.5 p-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={BellIcon}
                title="You're all caught up"
                description="New activity across your hotel will show up here."
                className="border-none py-10"
              />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markRead.mutate(id)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            nativeButton={false}
            render={<Link href={`${basePath}/notifications`} />}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
