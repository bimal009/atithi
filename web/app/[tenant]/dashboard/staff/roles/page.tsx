import type { Metadata } from "next";
import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { listHotelRoles, listPermissions, listSystemRoles } from "@/features/tenant/role/api/role";
import { RolesPageClient } from "@/features/tenant/role/components/roles-page-client";
import type { RoleTab } from "@/features/tenant/role/types";
import { getErrorMessage } from "@/lib/axios";

export const metadata: Metadata = {
  title: "Roles & Permissions · Atithi",
};

async function loadRolesPageData(tenant: string, activeTab: RoleTab) {
  try {
    const [{ data: rolesData }, { data: permissionsData }] = await Promise.all([
      activeTab === "system" ? listSystemRoles(tenant) : listHotelRoles(tenant),
      listPermissions(tenant),
    ]);
    return { ok: true as const, roles: rolesData.roles, permissions: permissionsData.permissions };
  } catch (error) {
    return { ok: false as const, message: getErrorMessage(error) };
  }
}

export default async function RolesPage(
  props: PageProps<"/[tenant]/dashboard/staff/roles">,
) {
  const { tenant } = await props.params;
  const searchParams = await props.searchParams;
  const activeTab: RoleTab = searchParams.tab === "custom" ? "custom" : "system";

  const result = await loadRolesPageData(tenant, activeTab);

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Roles & Permissions"
          description="What each role can see and do."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load roles</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <RolesPageClient
      tenant={tenant}
      activeTab={activeTab}
      roles={result.roles}
      permissions={result.permissions}
    />
  );
}
