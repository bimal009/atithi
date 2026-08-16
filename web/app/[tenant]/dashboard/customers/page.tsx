import type { Metadata } from "next";

import { CustomersPageClient } from "@/features/tenant/customer/components/customers-page-client";

export const metadata: Metadata = {
  title: "Customers · Atithi",
};

export default function CustomersPage() {
  return <CustomersPageClient />;
}
