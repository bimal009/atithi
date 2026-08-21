"use client";

import { AlertCircleIcon, BellIcon, CheckCheckIcon } from "lucide-react";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { SectionCards } from "@/components/shared/section-cards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/axios";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
  useRemoveNotification,
  useUnreadNotificationsCount,
} from "../client/useNotifications";
import type { Notification } from "../types";
import { NotificationItem } from "./notification-item";

const PAGE_SIZE = 15;

const tabParser = parseAsStringLiteral(["all", "unread"] as const)
  .withDefault("all")
  .withOptions({ history: "replace" });
const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

function dayGroup(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return "Earlier";
}

function GroupedList({
  notifications,
  onMarkRead,
  onRemove,
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <Card className="gap-0 py-0">
        <EmptyState
          icon={BellIcon}
          title="Nothing here"
          description="Activity will show up here as it happens."
          className="border-none py-12"
        />
      </Card>
    );
  }

  const groups: Array<[string, Notification[]]> = [];
  for (const notification of notifications) {
    const label = dayGroup(notification.createdAt);
    const existing = groups.find(([g]) => g === label);
    if (existing) {
      existing[1].push(notification);
    } else {
      groups.push([label, [notification]]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([label, items]) => (
        <Card key={label} className="gap-0 py-0">
          <div className="border-b px-5 py-2.5 text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <div className="flex flex-col gap-0.5 p-2">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkRead}
                onRemove={onRemove}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function NotificationsPageClient({ tenant }: { tenant: string }) {
  const [tab, setTab] = useQueryState("tab", tabParser);
  const [page, setPage] = useQueryState("page", pageParser);

  const notificationsQuery = useNotificationsQuery(tenant, {
    read: tab === "unread" ? false : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(tenant);
  const markRead = useMarkNotificationRead(tenant);
  const markAllRead = useMarkAllNotificationsRead(tenant);
  const removeNotification = useRemoveNotification(tenant);

  if (notificationsQuery.isPending) {
    return <NotificationsSkeleton />;
  }

  if (notificationsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Notifications" description="Recent activity across your hotel." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>Could not load notifications</AlertTitle>
          <AlertDescription>{getErrorMessage(notificationsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { notifications, total } = notificationsQuery.data;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Recent activity across your hotel."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheckIcon data-icon="inline-start" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <SectionCards
        stats={[
          { label: "Total notifications", value: String(total) },
          { label: "Unread", value: String(unreadCount) },
        ]}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as "all" | "unread");
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 flex flex-col gap-4">
          <GroupedList
            notifications={notifications}
            onMarkRead={(id) => markRead.mutate(id)}
            onRemove={(id) => removeNotification.mutate(id)}
          />
          <PaginationFooter page={page} pageCount={pageCount} onPageChange={setPage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
