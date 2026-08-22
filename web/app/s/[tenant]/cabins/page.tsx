import type { Metadata } from "next";

import { SiteShell } from "@/features/site/components/site-shell";
import { StayCard } from "@/features/site/components/stay-card";
import { dummyCabins, dummyHotel } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Cabins — ${dummyHotel.name}` };
}

export default async function CabinsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const basePath = `/s/${tenant}`;

  return (
    <SiteShell tenant={tenant} active="cabins">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-[family-name:var(--font-site-display)] text-4xl font-semibold text-stone-900">
            Cabins
          </h1>
          <p className="text-stone-500">For guests who want a little more room to breathe.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyCabins.map((cabin) => (
            <StayCard key={cabin.id} stay={cabin} basePath={basePath} kind="cabins" />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
