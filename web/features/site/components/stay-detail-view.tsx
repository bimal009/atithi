"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, MaximizeIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteThemeProvider } from "@/features/tenant/website/templates/site-theme-provider";
import { TEMPLATE_MODE } from "@/features/tenant/website/templates/registry";

export type StayLike = {
  id: string;
  name: string;
  images: string[];
  capacity: number;
  description?: string;
  amenities: string[];
  basePrice: number;
  pricingLabel?: string;
};

function waLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function StayDetailView({
  kind,
  stay,
  related,
  hotelName,
  hotelPhone,
  theme,
  fontPairing,
  currency,
  basePath,
}: {
  kind: "rooms" | "cabins";
  stay: StayLike;
  related: StayLike[];
  hotelName: string;
  hotelPhone: string;
  theme: string;
  fontPairing: string;
  currency: string;
  basePath: string;
}) {
  const formatMoney = React.useCallback(
    (amount: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount),
    [currency],
  );
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
    <SiteThemeProvider
      themeId={theme}
      mode={TEMPLATE_MODE.stonehouse ?? "light"}
      fontPairingId={fontPairing}
      className="h-screen overflow-y-auto scrollbar-none"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 sm:py-14">
        <Button
          variant="ghost"
          className="w-fit rounded-full text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
          render={<Link href={`${basePath}/${kind}`} />}
        >
          <ArrowLeftIcon className="mr-1.5 size-4" />
          All {kind}
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-3xl border border-[var(--site-border)]">
              {stay.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                <img
                  src={stay.images[active]}
                  alt={`${stay.name} view ${active + 1}`}
                  className="aspect-4/3 w-full object-cover"
                />
              ) : (
                <div className="aspect-4/3 w-full bg-[var(--site-primary)]/10" />
              )}
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
                        ? "overflow-hidden rounded-xl border-2 border-[var(--site-primary)]"
                        : "cursor-pointer overflow-hidden rounded-xl border-2 border-transparent hover:border-[var(--site-border)]"
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                    <img src={img} alt="" className="aspect-4/3 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
                {stay.name}
              </h1>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--site-muted)]">
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="size-4" />
                  Sleeps {stay.capacity}
                </span>
                {stay.pricingLabel && (
                  <span className="flex items-center gap-1.5">
                    <MaximizeIcon className="size-4" />
                    {stay.pricingLabel}
                  </span>
                )}
              </div>
              {stay.description && (
                <p className="text-[var(--site-muted)]">{stay.description}</p>
              )}

              {stay.amenities.length > 0 && (
                <>
                  <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold">
                    Amenities
                  </h2>
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {stay.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-2.5 text-sm">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--site-primary)]/10 text-[var(--site-primary)]">
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

          <aside className="h-fit lg:sticky lg:top-10">
            <div className="flex flex-col gap-3 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-5 sm:p-6">
              <p className="text-sm text-[var(--site-muted)]">
                <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--site-fg)]">
                  {formatMoney(stay.basePrice)}
                </span>{" "}
                / night
              </p>
              <span className="text-xs font-medium text-[var(--site-muted)]">Check-in</span>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent"
              />
              <span className="text-xs font-medium text-[var(--site-muted)]">Check-out</span>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent"
              />
              <span className="text-xs font-medium text-[var(--site-muted)]">Guests</span>
              <Input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
                className="bg-transparent"
              />
              <Button
                className="mt-1 rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                onClick={requestBooking}
              >
                Request booking
              </Button>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-4 flex flex-col gap-5">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              You may also like
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((s) => (
                <Link
                  key={s.id}
                  href={`${basePath}/${kind}/${s.id}`}
                  className="group grid grid-cols-[7rem_1fr] items-center gap-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-3 transition-shadow hover:shadow-md sm:grid-cols-[9rem_1fr]"
                >
                  {s.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                    <img
                      src={s.images[0]}
                      alt={s.name}
                      className="aspect-4/3 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="aspect-4/3 w-full rounded-xl bg-[var(--site-primary)]/10" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="mt-1 text-sm text-[var(--site-muted)]">
                      {formatMoney(s.basePrice)} / night
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteThemeProvider>
  );
}
