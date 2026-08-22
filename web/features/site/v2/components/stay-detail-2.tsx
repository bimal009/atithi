"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "../../lib/dummy-data";
import { waLink } from "../../components/whatsapp-icon";

export type StayDetail2Data = {
  id: string;
  name: string;
  images: string[];
  capacity: number;
  basePrice: number;
  pricingLabel?: string;
  description: string;
  amenities: string[];
};

export function StayDetail2({
  kind,
  stay,
  related,
  hotelName,
  hotelPhone,
  basePath,
}: {
  kind: "rooms" | "cabins";
  stay: StayDetail2Data;
  related: StayDetail2Data[];
  hotelName: string;
  hotelPhone: string;
  basePath: string;
}) {
  const [active, setActive] = React.useState(0);
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guests, setGuests] = React.useState(2);

  function requestBooking() {
    const message = [
      `Booking request for ${hotelName}:`,
      `- ${stay.name}`,
      `Check-in: ${checkIn || "flexible"}`,
      `Check-out: ${checkOut || "flexible"}`,
      `Guests: ${guests}`,
    ].join("\n");
    window.open(waLink(hotelPhone, message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <Link
        href={`${basePath}/${kind}`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-[#17181A]/60 hover:text-[#17181A]"
      >
        <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
        All {kind}
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-sm bg-[#17181A]/5">
            {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
            <img
              src={stay.images[active]}
              alt={`${stay.name} view ${active + 1}`}
              className="aspect-4/3 w-full object-cover"
            />
          </div>
          {stay.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {stay.images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={
                    i === active
                      ? "overflow-hidden rounded-sm opacity-100 ring-2 ring-[#4B5D46] ring-offset-2 ring-offset-[#FAFAF8]"
                      : "cursor-pointer overflow-hidden rounded-sm opacity-60 transition-opacity hover:opacity-100"
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                  <img src={img} alt="" className="aspect-4/3 w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-[#17181A]/10 pt-6">
            <h1 className="font-[family-name:var(--font-site2-display)] text-3xl font-semibold sm:text-4xl">
              {stay.name}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#17181A]/55">
              <span className="flex items-center gap-1.5">
                <UsersIcon className="size-4" strokeWidth={1.75} />
                Sleeps {stay.capacity}
              </span>
              {stay.pricingLabel && <span>{stay.pricingLabel}</span>}
            </div>
            <p className="text-[#17181A]/65">{stay.description}</p>

            {stay.amenities.length > 0 && (
              <>
                <h2 className="mt-4 font-[family-name:var(--font-site2-display)] text-lg font-semibold">
                  Amenities
                </h2>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {stay.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2.5 text-sm text-[#17181A]/75">
                      <CheckIcon className="size-4 shrink-0 text-[#4B5D46]" strokeWidth={2} />
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="flex flex-col gap-3 rounded-sm border border-[#17181A]/10 bg-white p-5 sm:p-6">
            <p className="text-sm text-[#17181A]/55">
              <span className="font-[family-name:var(--font-site2-display)] text-3xl font-semibold text-[#17181A]">
                {formatMoney(stay.basePrice)}
              </span>{" "}
              / night
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">
                <CalendarIcon className="size-3.5" strokeWidth={1.75} />
                Check-in
              </span>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">
                <CalendarIcon className="size-3.5" strokeWidth={1.75} />
                Check-out
              </span>
              <Input
                type="date"
                value={checkOut}
                min={checkIn || undefined}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">Guests</span>
              <Input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
              />
            </label>
            <Button
              className="mt-1 rounded-sm bg-[#17181A] text-white hover:bg-[#17181A]/85"
              onClick={requestBooking}
            >
              Request booking
            </Button>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="flex flex-col gap-5 border-t border-[#17181A]/10 pt-10">
          <h2 className="font-[family-name:var(--font-site2-display)] text-xl font-semibold">
            You may also like
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {related.map((s) => (
              <Link
                key={s.id}
                href={`${basePath}/${kind}/${s.id}`}
                className="group grid grid-cols-[7rem_1fr] items-center gap-4 sm:grid-cols-[9rem_1fr]"
              >
                <div className="overflow-hidden rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                  <img
                    src={s.images[0]}
                    alt={s.name}
                    className="aspect-4/3 w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-[#4B5D46]">{s.name}</p>
                  <p className="mt-1 text-sm text-[#17181A]/55">{formatMoney(s.basePrice)} / night</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
