import type { Metadata } from "next";

import { BillingTypesGrid } from "@/features/tenant/billingType/components/billing-types-grid";

export const metadata: Metadata = {
  title: "Billing Types · Atithi",
};

export default async function BillingTypesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BillingTypesGrid id={id} />;
}
