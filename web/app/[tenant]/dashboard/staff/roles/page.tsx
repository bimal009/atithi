import type { Metadata } from "next";

import { RolesPageClient } from "@/features/tenant/role/components/roles-page-client";

export const metadata: Metadata = {
  title: "Roles & Permissions · Atithi",
};

export default function RolesPage() {
  return <RolesPageClient />;
}
