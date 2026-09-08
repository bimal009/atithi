import type { Metadata } from "next";

import { NotificationsPageClient } from "@/features/tenant/notification/components/notifications-page-client";

export const metadata: Metadata = {
  title: "Notifications · Atithi",
};

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <NotificationsPageClient id={id} />;
}
