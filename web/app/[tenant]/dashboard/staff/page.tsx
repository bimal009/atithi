import type { Metadata } from "next";

import { StaffPageClient } from "@/features/tenant/member/components/staff-page-client";

export const metadata: Metadata = {
  title: "Staff · Atithi",
};

export default function StaffPage() {
  return <StaffPageClient />;
}
