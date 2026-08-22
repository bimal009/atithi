import Link from "next/link";
import { UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "../lib/dummy-data";

export type StayCardData = {
  id: string;
  name: string;
  images: string[];
  capacity: number;
  basePrice: number;
  description: string;
};

export function StayCard({
  stay,
  basePath,
  kind,
}: {
  stay: StayCardData;
  basePath: string;
  kind: "rooms" | "cabins";
}) {
  const href = `${basePath}/${kind}/${stay.id}`;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-lg hover:shadow-stone-900/5">
      <Link href={href} className="block aspect-4/3 overflow-hidden bg-stone-100" tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
        <img
          src={stay.images[0]}
          alt={stay.name}
          className="size-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <Link
          href={href}
          className="line-clamp-1 font-[family-name:var(--font-site-display)] text-lg font-semibold text-stone-900 hover:text-amber-800"
        >
          {stay.name}
        </Link>
        <p className="line-clamp-2 min-h-10 text-sm text-stone-500">{stay.description}</p>
        <span className="flex items-center gap-1.5 text-xs text-stone-500">
          <UsersIcon className="size-3.5" />
          Up to {stay.capacity} guests
        </span>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-[family-name:var(--font-site-display)] text-xl font-semibold text-amber-800">
            {formatMoney(stay.basePrice)}
            <span className="ml-1 text-xs font-normal text-stone-500">/ night</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900"
              nativeButton={false}
              render={<Link href={href} />}
            >
              Details
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
              nativeButton={false}
              render={<Link href={href} />}
            >
              Book now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
