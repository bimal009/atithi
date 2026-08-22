import type { Metadata } from "next";

import { BillingTypesGrid } from "@/features/tenant/billingType/components/billing-types-grid";

export const metadata: Metadata = {
  title: "Billing Types · Atithi",
};

export default async function BillingTypesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <BillingTypesGrid tenant={tenant} />;
}
