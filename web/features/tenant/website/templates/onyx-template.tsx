import { ArrowUpRightIcon, MailIcon, MapPinIcon, PhoneIcon, UsersIcon } from "lucide-react";

import type { SiteData } from "../types";

export function OnyxTemplate({ data }: { data: SiteData; themeId: string }) {
  const { hotel, roomTypes, cabins, tables, menuItems, formatMoney, content } = data;
  const gallery = [...cabins.flatMap((c) => c.images), ...tables.flatMap((t) => t.images)];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Top nav-ish label row */}
      <div className="flex items-center justify-between text-xs text-[var(--site-muted)] uppercase">
        <span className="font-[family-name:var(--font-display)] tracking-wide text-[var(--site-fg)]">
          {hotel.name}
        </span>
        <span>{hotel.city ?? hotel.address}</span>
      </div>

      {/* Hero bento — big cell + 3 stat/support cells */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative col-span-1 row-span-2 flex flex-col justify-end overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-8 sm:col-span-3">
          {hotel.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hotel.logoUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full scale-110 object-cover opacity-20"
            />
          )}
          <h1 className="relative max-w-lg text-balance font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight sm:text-5xl">
            {content.heroHeading}
          </h1>
          <p className="relative mt-4 max-w-md text-[var(--site-muted)]">
            {content.heroSubheading}
          </p>
          <a
            href={`tel:${hotel.phoneNumber}`}
            className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--site-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--site-primary-fg)]"
          >
            {content.ctaLabel}
            <ArrowUpRightIcon className="size-4" />
          </a>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-5">
          <span className="text-xs text-[var(--site-muted)] uppercase">Room types</span>
          <span className="font-[family-name:var(--font-display)] text-3xl font-bold">
            {roomTypes.length}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--site-border)] bg-[var(--site-primary)] p-5 text-[var(--site-primary-fg)]">
          <span className="text-xs uppercase opacity-80">On the menu</span>
          <span className="font-[family-name:var(--font-display)] text-3xl font-bold">
            {menuItems.length}
          </span>
        </div>
      </section>

      {/* Gallery bento */}
      {gallery.length > 0 && (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.slice(0, 5).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url + i}
              src={url}
              alt=""
              className={`w-full rounded-2xl border border-[var(--site-border)] object-cover ${
                i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
              }`}
            />
          ))}
        </section>
      )}

      {/* About strip */}
      <section className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-8">
        <span className="text-xs text-[var(--site-primary)] uppercase">
          {content.aboutHeading}
        </span>
        <p className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-xl font-medium">
          {content.aboutBody}
        </p>
      </section>

      {/* Rooms grid */}
      {roomTypes.length > 0 && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {roomTypes.map((room) => (
            <div
              key={room.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-6"
            >
              <div className="flex flex-col gap-1">
                <span className="font-[family-name:var(--font-display)] text-lg font-bold">
                  {room.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--site-muted)]">
                  <UsersIcon className="size-3.5" />
                  Up to {room.capacity}
                </span>
              </div>
              <span className="text-[var(--site-primary)]">{formatMoney(room.basePrice)}</span>
            </div>
          ))}
        </section>
      )}

      {/* Footer */}
      <footer className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] px-8 py-8 text-sm text-[var(--site-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span className="font-[family-name:var(--font-display)] font-bold text-[var(--site-fg)]">
          {hotel.name}
        </span>
        <div className="flex flex-wrap items-center gap-5">
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
