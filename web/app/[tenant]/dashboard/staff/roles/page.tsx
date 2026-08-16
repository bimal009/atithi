import type { Metadata } from "next";
import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTitle } from "@/features/tenant/dashboard/page-title-context";
import { listRoles } from "@/features/tenant/role/api/role";
import { RolesGrid } from "@/features/tenant/role/components/roles-grid";
import type { Role } from "@/features/tenant/role/types";
import { getErrorMessage } from "@/lib/axios";

export const metadata: Metadata = {
  title: "Roles & Permissions · Atithi",
};

async function loadRoles(tenant: string) {
  try {
    const { data } = await listRoles(tenant);
    return { ok: true as const, roles: data.roles };
  } catch (error) {
    return { ok: false as const, message: getErrorMessage(error) };
  }
}

export default async function RolesPage(
  props: PageProps<"/[tenant]/dashboard/staff/roles">,
) {
  const { tenant } = await props.params;
  const result = await loadRoles(tenant);

  if (!result.ok) {
    return (
      <>
        <PageTitle title="Roles & Permissions" />
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
      </>
    );
  }

  const roles: Role[] = result.roles;

  return (
    <>
      <PageTitle title="Roles & Permissions" />
      <RolesGrid roles={roles} />
    </>
  );
}
