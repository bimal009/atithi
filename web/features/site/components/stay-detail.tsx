"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "../lib/dummy-data";
import { waLink } from "./whatsapp-icon";

export type StayDetailData = {
  id: string;
  name: string;
  images: string[];
  capacity: number;
  basePrice: number;
  pricingLabel?: string;
  description: string;
  amenities: string[];
};

export function StayDetail({
  kind,
  stay,
  related,
  hotelName,
  hotelPhone,
  basePath,
}: {
  kind: "rooms" | "cabins";
  stay: StayDetailData;
  related: StayDetailData[];
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <Button
        variant="ghost"
        className="w-fit rounded-full text-stone-700 hover:bg-stone-900/5 hover:text-stone-900"
        nativeButton={false}
        render={<Link href={`${basePath}/${kind}`} />}
      >
        <ArrowLeftIcon className="mr-1.5 size-4" />
        All {kind}
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
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
                      ? "overflow-hidden rounded-xl border-2 border-amber-700"
                      : "cursor-pointer overflow-hidden rounded-xl border-2 border-transparent hover:border-stone-300"
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                  <img src={img} alt="" className="aspect-4/3 w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h1 className="font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
              {stay.name}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <UsersIcon className="size-4" />
                Sleeps {stay.capacity}
              </span>
              {stay.pricingLabel && <span>{stay.pricingLabel}</span>}
            </div>
            <p className="text-stone-600">{stay.description}</p>

            {stay.amenities.length > 0 && (
              <>
                <h2 className="mt-4 font-[family-name:var(--font-site-display)] text-xl font-semibold text-stone-900">
                  Amenities
                </h2>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {stay.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2.5 text-sm text-stone-700">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-700/10 text-amber-800">
                        <CheckIcon className="size-3.5" />
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <p className="text-sm text-stone-500">
              <span className="font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900">
                {formatMoney(stay.basePrice)}
              </span>{" "}
              / night
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                <CalendarIcon className="size-3.5" />
                Check-in
              </span>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                <CalendarIcon className="size-3.5" />
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
              <span className="text-xs font-medium text-stone-500">Guests</span>
              <Input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
              />
            </label>
            <Button
              className="mt-1 rounded-full bg-amber-700 text-white hover:bg-amber-800"
              onClick={requestBooking}
            >
              Request booking
            </Button>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="mt-4 flex flex-col gap-5">
          <h2 className="font-[family-name:var(--font-site-display)] text-2xl font-semibold text-stone-900">
            You may also like
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((s) => (
              <Link
                key={s.id}
                href={`${basePath}/${kind}/${s.id}`}
                className="group grid grid-cols-[7rem_1fr] items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3 transition-shadow hover:shadow-md sm:grid-cols-[9rem_1fr]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                <img
                  src={s.images[0]}
                  alt={s.name}
                  className="aspect-4/3 w-full rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{s.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{formatMoney(s.basePrice)} / night</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
