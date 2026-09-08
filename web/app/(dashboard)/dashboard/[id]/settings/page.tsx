import type { Metadata } from "next";

import { SettingsPageClient } from "@/features/tenant/dashboard/settings/settings-page-client";

export const metadata: Metadata = {
  title: "Settings · Atithi",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SettingsPageClient id={id} />;
}
