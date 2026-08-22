import type { Metadata } from "next";

import { CustomersPageClient } from "@/features/tenant/customer/components/customers-page-client";

export const metadata: Metadata = {
  title: "Customers · Atithi",
};

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <CustomersPageClient tenant={tenant} />;
}
