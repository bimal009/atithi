import type { Metadata } from "next";

import { CustomersPageClient } from "@/features/tenant/customer/components/customers-page-client";

export const metadata: Metadata = {
  title: "Customers · Atithi",
};

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CustomersPageClient id={id} />;
}
