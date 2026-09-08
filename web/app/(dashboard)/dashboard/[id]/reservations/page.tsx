import type { Metadata } from "next";

import { ReservationsTable } from "@/features/tenant/reservation/components/reservations-table";

export const metadata: Metadata = {
  title: "Reservations · Atithi",
};

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ReservationsTable id={id} />;
}
