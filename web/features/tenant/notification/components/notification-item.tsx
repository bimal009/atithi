"use client";

import { Trash2Icon } from "lucide-react";

import { cn, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { getNotificationMeta } from "../notification-meta";
import type { Notification } from "../types";

export function NotificationItem({
  notification,
  onMarkRead,
  onRemove,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const { icon: Icon, className } = getNotificationMeta(notification.type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !notification.read) {
          e.preventDefault();
          onMarkRead(notification.id);
        }
      }}
      className={cn(
        "group/notification flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
        !notification.read ? "cursor-pointer bg-primary/4" : "cursor-default",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          className,
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
        <span
          className={cn(
            "text-sm leading-snug",
            notification.read ? "text-foreground/75" : "font-medium text-foreground",
          )}
        >
          {notification.title}
        </span>
        {notification.subtitle && (
          <span className="truncate text-xs text-muted-foreground">
            {notification.subtitle}
          </span>
        )}
        <span className="text-xs text-muted-foreground tabular-nums">
          {timeAgo(notification.createdAt)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 pt-1.5">
        {!notification.read && (
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 transition-opacity group-hover/notification:opacity-100 focus-visible:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
          >
            <Trash2Icon />
            <span className="sr-only">Delete notification</span>
          </Button>
        )}
      </div>
    </div>
  );
}
