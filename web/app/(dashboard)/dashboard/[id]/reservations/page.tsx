import type { Metadata } from "next";

import { ReservationsTable } from "@/features/tenant/reservation/components/reservations-table";

export const metadata: Metadata = {
  title: "Reservations · Atithi",
};

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <ReservationsTable tenant={tenant} />;
}
