import { LeafIcon, MailIcon, MapPinIcon, PhoneIcon, UsersIcon } from "lucide-react";

import type { SiteData } from "../types";

export function VerdantTemplate({ data }: { data: SiteData; themeId: string }) {
  const { hotel, roomTypes, cabins, tables, menuItems, formatMoney, content } = data;
  const gallery = [...cabins.flatMap((c) => c.images), ...tables.flatMap((t) => t.images)].slice(
    0,
    3,
  );

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero — asymmetric split */}
      <section className="grid grid-cols-1 items-center gap-10 px-6 pt-16 sm:grid-cols-2 sm:px-12">
        <div className="flex flex-col items-start gap-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--site-primary)]/10 px-3 py-1 text-xs text-[var(--site-primary)]">
            <LeafIcon className="size-3.5" />
            Nestled in nature
          </span>
          <h1 className="text-balance font-[family-name:var(--font-display)] text-5xl leading-[1.05] font-medium italic">
            {content.heroHeading}
          </h1>
          <p className="max-w-md font-[family-name:var(--font-body)] text-[var(--site-muted)]">
            {content.heroSubheading}
          </p>
          <a
            href={`tel:${hotel.phoneNumber}`}
            className="mt-2 rounded-full bg-[var(--site-primary)] px-7 py-3 text-sm font-medium text-[var(--site-primary-fg)] transition-transform hover:-translate-y-0.5"
          >
            {content.ctaLabel}
          </a>
        </div>
        <div className="relative aspect-4/5 overflow-hidden rounded-[2.5rem]">
          {hotel.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hotel.logoUrl} alt={hotel.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[var(--site-primary)]/15">
              <LeafIcon className="size-16 text-[var(--site-primary)]" />
            </div>
          )}
          <div className="absolute -bottom-6 -left-6 size-28 rounded-full bg-[var(--site-accent)]/25 blur-2xl" />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-2xl px-6 text-center sm:px-12">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl italic">
          {content.aboutHeading}
        </h2>
        <p className="text-[var(--site-muted)]">{content.aboutBody}</p>
      </section>

      {/* Gallery — organic masonry */}
      {gallery.length > 0 && (
        <section className="grid grid-cols-3 gap-4 px-6 sm:px-12">
          {gallery.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url + i}
              src={url}
              alt=""
              className={`w-full object-cover ${
                i === 0
                  ? "aspect-square rounded-[2rem]"
                  : i === 1
                    ? "mt-8 aspect-[4/5] rounded-[3rem]"
                    : "aspect-[3/4] rounded-2xl"
              }`}
            />
          ))}
        </section>
      )}

      {/* Rooms — horizontal cards */}
      {roomTypes.length > 0 && (
        <section className="flex flex-col gap-6 px-6 sm:px-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl italic">Stay with us</h2>
          <div className="flex flex-col gap-4">
            {roomTypes.map((room) => (
              <div
                key={room.id}
                className="flex flex-col items-start justify-between gap-3 rounded-3xl bg-[var(--site-card)] p-6 sm:flex-row sm:items-center"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-[family-name:var(--font-display)] text-lg">
                    {room.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[var(--site-muted)]">
                    <UsersIcon className="size-3.5" />
                    Up to {room.capacity} guests
                  </span>
                </div>
                <span className="rounded-full bg-[var(--site-primary)]/10 px-4 py-1.5 text-sm text-[var(--site-primary)]">
                  {formatMoney(room.basePrice)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Food */}
      {menuItems.length > 0 && (
        <section className="flex flex-col gap-6 px-6 sm:px-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl italic">
            Fresh from our kitchen
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {menuItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 overflow-hidden rounded-2xl bg-[var(--site-card)]"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="aspect-square w-full bg-[var(--site-primary)]/10" />
                )}
                <div className="flex flex-col gap-0.5 px-3 pb-3">
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-[var(--site-muted)]">
                    {formatMoney(item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mx-6 flex flex-col items-center gap-3 rounded-[2rem] bg-[var(--site-primary)] px-6 py-10 text-center text-[var(--site-primary-fg)] sm:mx-12">
        <span className="font-[family-name:var(--font-display)] text-xl italic">
          {hotel.name}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-5 text-sm opacity-90">
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
