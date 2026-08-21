"use client";

import { AlertCircleIcon, BellIcon, CheckCheckIcon, Trash2Icon } from "lucide-react";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/axios";
import { cn, timeAgo } from "@/lib/utils";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
  useRemoveNotification,
  useUnreadNotificationsCount,
} from "../client/useNotifications";
import { getNotificationMeta } from "../notification-meta";
import type { Notification } from "../types";

const PAGE_SIZE = 10;

const READ_FILTERS: Array<{ value: "all" | "unread"; label: string }> = [
  { value: "all", label: "All notifications" },
  { value: "unread", label: "Unread only" },
];
const READ_ITEMS = Object.fromEntries(READ_FILTERS.map((o) => [o.value, o.label]));

const filterParser = parseAsStringLiteral(["all", "unread"] as const)
  .withDefault("all")
  .withOptions({ history: "replace" });
const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

export function NotificationsPageClient({ tenant }: { tenant: string }) {
  const [filter, setFilter] = useQueryState("filter", filterParser);
  const [page, setPage] = useQueryState("page", pageParser);

  const notificationsQuery = useNotificationsQuery(tenant, {
    read: filter === "unread" ? false : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(tenant);
  const markRead = useMarkNotificationRead(tenant);
  const markAllRead = useMarkAllNotificationsRead(tenant);
  const removeNotification = useRemoveNotification(tenant);

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

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

  const notifications = notificationsQuery.data?.notifications ?? [];
  const total = notificationsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: DataTableColumn<Notification>[] = [
    {
      key: "notification",
      header: "Notification",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (n) => {
        const { icon: Icon, className } = getNotificationMeta(n.type);
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                className,
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span
                className={cn(
                  "truncate text-sm",
                  n.read ? "text-foreground/80" : "font-medium text-foreground",
                )}
              >
                {n.title}
              </span>
              {n.subtitle && (
                <span className="truncate text-xs text-muted-foreground">{n.subtitle}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "time",
      header: "Time",
      cell: (n) => (
        <span className="text-muted-foreground tabular-nums">{timeAgo(n.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (n) => <StatusBadge status={n.read ? "read" : "unread"} />,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5",
      cell: (n) => (
        <div className="flex items-center justify-end gap-1">
          {!n.read && (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => markRead.mutate(n.id)}
            >
              Mark as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer text-muted-foreground hover:text-destructive"
            onClick={() => removeNotification.mutate(n.id)}
            aria-label="Delete notification"
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
    },
  ];

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

      <DataTable
        columns={columns}
        data={notifications}
        loading={notificationsQuery.isFetching}
        getRowId={(n) => n.id}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        toolbar={
          <Select
            items={READ_ITEMS}
            value={filter}
            onValueChange={(v) => {
              setFilter((v ?? "all") as typeof filter);
              resetToFirstPage();
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {READ_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        emptyIcon={BellIcon}
        emptyTitle="No notifications"
        emptyDescription="Activity will show up here as it happens."
      />
    </div>
  );
}
