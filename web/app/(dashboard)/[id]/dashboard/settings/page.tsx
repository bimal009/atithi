import type { Metadata } from "next";

import { SettingsPageClient } from "@/features/tenant/dashboard/settings/settings-page-client";

export const metadata: Metadata = {
  title: "Settings · Atithi",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <SettingsPageClient tenant={tenant} />;
}
