import type { BillingType } from "@/features/tenant/billingType/types";

export function billingTypeName(
  billingTypes: BillingType[],
  id?: string | null,
): string {
  if (!id) return "—";
  return billingTypes.find((b) => b.id === id)?.name ?? "—";
}
