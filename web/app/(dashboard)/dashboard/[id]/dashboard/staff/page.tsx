import type { Metadata } from "next";

import { StaffPageClient } from "@/features/tenant/member/components/staff-page-client";

export const metadata: Metadata = {
  title: "Staff · Atithi",
};

export default async function StaffPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <StaffPageClient tenant={tenant} />;
}
