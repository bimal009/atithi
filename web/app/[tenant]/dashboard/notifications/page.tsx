import type { Metadata } from "next";

import { NotificationsPageClient } from "@/features/tenant/notification/components/notifications-page-client";

export const metadata: Metadata = {
  title: "Notifications · Atithi",
};

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <NotificationsPageClient tenant={tenant} />;
}
