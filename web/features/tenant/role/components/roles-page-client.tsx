"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

import type { Permission, RoleSummary, RoleTab } from "../types";
import { RolesGrid } from "./roles-grid";

const tabParser = parseAsStringLiteral(["system", "custom"] as const)
  .withDefault("system")
  .withOptions({ shallow: false, history: "replace" });

export function RolesPageClient({
  tenant,
  activeTab,
  roles,
  permissions,
}: {
  tenant: string;
  activeTab: RoleTab;
  roles: RoleSummary[];
  permissions: Permission[];
}) {
  const [, setTab] = useQueryState("tab", tabParser);

  return (
    <RolesGrid
      tenant={tenant}
      activeTab={activeTab}
      onTabChange={setTab}
      roles={roles}
      permissions={permissions}
    />
  );
}
