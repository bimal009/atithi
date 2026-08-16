import type { Metadata } from "next";

import { HotelsPageClient } from "@/features/hotel/components/hotels-page-client";

export const metadata: Metadata = {
  title: "Hotels · Atithi",
};

export default function HotelsPage() {
  return <HotelsPageClient />;
}
