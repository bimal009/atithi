import type { Metadata } from "next";

import { StaffPageClient } from "@/features/tenant/member/components/staff-page-client";

export const metadata: Metadata = {
  title: "Staff · Atithi",
};

export default async function StaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StaffPageClient id={id} />;
}
