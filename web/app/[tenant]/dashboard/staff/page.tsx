import type { Metadata } from "next";
import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTitle } from "@/features/tenant/dashboard/page-title-context";
import { listMembers } from "@/features/tenant/member/api/member";
import { StaffTable } from "@/features/tenant/member/components/staff-table";
import { listRoles } from "@/features/tenant/role/api/role";
import { getErrorMessage } from "@/lib/axios";

export const metadata: Metadata = {
  title: "Staff · Atithi",
};

async function loadStaffPageData(tenant: string) {
  try {
    const [{ data: members }, { data: roles }] = await Promise.all([
      listMembers(tenant),
      listRoles(tenant),
    ]);
    return { ok: true as const, members: members.members, roles: roles.roles };
  } catch (error) {
    return { ok: false as const, message: getErrorMessage(error) };
  }
}

export default async function StaffPage(
  props: PageProps<"/[tenant]/dashboard/staff">,
) {
  const { tenant } = await props.params;
  const result = await loadStaffPageData(tenant);

  if (!result.ok) {
    return (
      <>
        <PageTitle title="Staff" />
        <div className="flex flex-col gap-6">
          <PageHeader title="Staff" description="Your team, and who can do what." />
          <Alert variant="destructive">
            <AlertCircleIcon aria-hidden />
            <AlertTitle>Could not load staff</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Staff" />
      <StaffTable tenant={tenant} members={result.members} roles={result.roles} />
    </>
  );
}
