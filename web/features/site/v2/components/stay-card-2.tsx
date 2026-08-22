import Link from "next/link";
import { UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "../../lib/dummy-data";

export type StayCard2Data = {
  id: string;
  name: string;
  images: string[];
  capacity: number;
  basePrice: number;
  description: string;
};

export function StayCard2({
  stay,
  basePath,
  kind,
}: {
  stay: StayCard2Data;
  basePath: string;
  kind: "rooms" | "cabins";
}) {
  const href = `${basePath}/${kind}/${stay.id}`;
  return (
    <div className="group flex flex-col gap-3">
      <Link href={href} className="block aspect-4/3 overflow-hidden rounded-sm bg-[#17181A]/5" tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
        <img
          src={stay.images[0]}
          alt={stay.name}
          className="size-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <Link
          href={href}
          className="line-clamp-1 font-[family-name:var(--font-site2-display)] text-lg font-semibold text-[#17181A] hover:text-[#4B5D46]"
        >
          {stay.name}
        </Link>
        <p className="line-clamp-2 min-h-10 text-sm text-[#17181A]/55">{stay.description}</p>
        <span className="flex items-center gap-1.5 text-xs text-[#17181A]/50">
          <UsersIcon className="size-3.5" strokeWidth={1.75} />
          Up to {stay.capacity} guests
        </span>
        <div className="mt-1 flex items-center justify-between border-t border-[#17181A]/10 pt-3">
          <span className="font-[family-name:var(--font-site2-display)] text-lg font-semibold text-[#4B5D46]">
            {formatMoney(stay.basePrice)}
            <span className="ml-1 text-xs font-normal text-[#17181A]/50">/ night</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href={href} className="text-sm font-medium text-[#17181A]/70 hover:text-[#17181A]">
              Details
            </Link>
            <Button
              size="sm"
              className="rounded-sm bg-[#17181A] text-white hover:bg-[#17181A]/85"
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
