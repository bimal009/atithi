import type { Metadata } from "next";

import { RoomTypesPageClient } from "@/features/tenant/roomType/components/room-types-page-client";

export const metadata: Metadata = {
  title: "Room Types · Atithi",
};

export default function RoomTypesPage() {
  return <RoomTypesPageClient />;
}
