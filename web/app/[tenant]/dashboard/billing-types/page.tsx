import type { Metadata } from "next";

import { BillingTypesPageClient } from "@/features/tenant/billingType/components/billing-types-page-client";

export const metadata: Metadata = {
  title: "Billing Types · Atithi",
};

export default async function BillingTypesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <BillingTypesPageClient tenant={tenant} />;
}
