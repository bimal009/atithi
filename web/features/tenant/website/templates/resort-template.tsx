"use client";

import * as React from "react";
import {
  DumbbellIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SparklesIcon,
  UsersIcon,
  UtensilsIcon,
  WavesIcon,
  WifiIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { SiteData } from "../types";

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: WifiIcon,
  internet: WifiIcon,
  pool: WavesIcon,
  swim: WavesIcon,
  gym: DumbbellIcon,
  fitness: DumbbellIcon,
  spa: SparklesIcon,
  restaurant: UtensilsIcon,
  dining: UtensilsIcon,
};

function amenityIcon(label: string) {
  const key = Object.keys(AMENITY_ICONS).find((k) => label.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : SparklesIcon;
}

type ResortPage = "home" | "rooms" | "contact";

export function ResortTemplate({ data }: { data: SiteData; themeId: string }) {
  const [page, setPage] = React.useState<ResortPage>("home");
  const { hotel, roomTypes, cabins, tables, content, formatMoney } = data;

  const amenities = [...new Set(roomTypes.flatMap((r) => r.amenities))].slice(0, 4);
  const gallery = [...cabins.flatMap((c) => c.images), ...tables.flatMap((t) => t.images)];

  const NAV: { id: ResortPage; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "rooms", label: "Rooms" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-[var(--site-border)] px-6 py-4 sm:px-10">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
          {hotel.name}
        </span>
        <div className="hidden items-center gap-6 text-sm sm:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              className={
                page === item.id
                  ? "font-medium text-[var(--site-primary)]"
                  : "cursor-pointer text-[var(--site-muted)] hover:text-[var(--site-fg)]"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
          render={<a href={`tel:${hotel.phoneNumber}`} />}
        >
          {content.ctaLabel}
        </Button>
      </nav>

      {/* Mobile page switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--site-border)] px-6 py-2 text-xs sm:hidden">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPage(item.id)}
            className={
              page === item.id
                ? "rounded-full bg-[var(--site-primary)] px-3 py-1 text-[var(--site-primary-fg)]"
                : "rounded-full px-3 py-1 text-[var(--site-muted)]"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {page === "home" && (
        <div className="flex flex-col gap-16 px-6 py-10 sm:px-10">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl">
            <div className="relative flex min-h-96 flex-col justify-end p-8 sm:p-12">
              {hotel.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hotel.logoUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 size-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative flex flex-col gap-4 text-white">
                <h1 className="max-w-lg text-balance font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
                  {content.heroHeading}
                </h1>
                <p className="max-w-md text-balance text-white/85">{content.heroSubheading}</p>
                <div>
                  <Button
                    size="lg"
                    className="mt-2 rounded-full bg-white text-black hover:bg-white/90"
                    onClick={() => setPage("rooms")}
                  >
                    Book now
                  </Button>
                </div>
              </div>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 bg-[var(--site-primary)] p-4 text-[var(--site-primary-fg)] sm:gap-3 sm:p-5">
                {amenities.map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className="border-white/30 bg-white/10 text-inherit"
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Amenities grid */}
          <section className="flex flex-col gap-6">
            <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-semibold">
              Rooms and amenities
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(amenities.length > 0 ? amenities : ["Comfort", "Service", "Location", "Value"]).map(
                (a) => {
                  const Icon = amenityIcon(a);
                  return (
                    <Card key={a} className="items-center gap-3 py-6 text-center">
                      <div className="flex size-11 items-center justify-center rounded-full bg-[var(--site-primary)]/10 text-[var(--site-primary)]">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-sm font-medium">{a}</span>
                    </Card>
                  );
                },
              )}
            </div>
          </section>

          {/* Split promo */}
          <section className="grid grid-cols-1 overflow-hidden rounded-3xl bg-[var(--site-card)] sm:grid-cols-2">
            <div className="min-h-64">
              {gallery[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gallery[0]} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-[var(--site-primary)]/10" />
              )}
            </div>
            <div className="flex flex-col justify-center gap-3 p-8">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                {content.aboutHeading}
              </h3>
              <p className="text-[var(--site-muted)]">{content.aboutBody}</p>
              <div>
                <Button variant="outline" size="sm" onClick={() => setPage("contact")}>
                  See details
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {page === "rooms" && (
        <div className="flex flex-col gap-12 px-6 py-10 sm:px-10">
          {/* Decorative booking form */}
          <Card className="mx-auto w-full max-w-3xl bg-[var(--site-primary)]/5 p-6">
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <h2 className="col-span-full text-center font-[family-name:var(--font-display)] text-xl font-semibold">
                Booking section
              </h2>
              <Input placeholder="Check-in date" readOnly className="bg-[var(--site-card)]" />
              <Input placeholder="Check-out date" readOnly className="bg-[var(--site-card)]" />
              <Input placeholder="Number of guests" readOnly className="bg-[var(--site-card)]" />
              <Input placeholder="Room type" readOnly className="bg-[var(--site-card)]" />
              <Button className="col-span-full rounded-full">Check availability</Button>
            </CardContent>
          </Card>

          {gallery.length > 0 && (
            <section className="flex flex-col gap-6">
              <h2 className="text-center font-[family-name:var(--font-display)] text-xl font-semibold">
                View with room images
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.slice(0, 6).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url + i}
                    src={url}
                    alt=""
                    className="aspect-4/3 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          {roomTypes.length > 0 && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {roomTypes.map((room) => (
                <Card key={room.id}>
                  <CardContent className="flex flex-col gap-2">
                    <span className="font-[family-name:var(--font-display)] font-semibold">
                      {room.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--site-muted)]">
                      <UsersIcon className="size-3.5" />
                      Up to {room.capacity}
                    </span>
                    <span className="text-[var(--site-primary)]">
                      {formatMoney(room.basePrice)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
        </div>
      )}

      {page === "contact" && (
        <div className="flex flex-col gap-10 px-6 py-10 sm:px-10">
          <section className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              Get in touch
            </h2>
            <p className="text-[var(--site-muted)]">
              {hotel.description ?? "We would love to host your next stay."}
            </p>
          </section>
          <div className="mx-auto flex aspect-video w-full max-w-2xl items-center justify-center rounded-3xl bg-[var(--site-card)] text-[var(--site-muted)]">
            <MapPinIcon className="size-8" />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto flex flex-col items-center gap-3 border-t border-[var(--site-border)] px-6 py-8 text-center text-sm text-[var(--site-muted)]">
        <span className="font-[family-name:var(--font-display)] text-base text-[var(--site-fg)]">
          {hotel.name}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-5">
          {hotel.address && (
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {hotel.address}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <PhoneIcon className="size-3.5" />
            {hotel.phoneNumber}
          </span>
          {hotel.email && (
            <span className="flex items-center gap-1.5">
              <MailIcon className="size-3.5" />
              {hotel.email}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
