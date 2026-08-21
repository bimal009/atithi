import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import type { SiteData } from "../types";

export function AuroraTemplate({ data }: { data: SiteData; themeId: string }) {
  const { hotel, roomTypes, cabins, menuItems, formatMoney, content } = data;
  const gallery = cabins.flatMap((c) => c.images).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[34rem] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {hotel.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.logoUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full scale-125 object-cover opacity-[0.08] blur-md"
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, var(--site-primary) 18%, transparent), transparent)",
          }}
        />
        <span className="relative mb-6 text-xs tracking-[0.35em] text-[var(--site-primary)] uppercase">
          Est. Hospitality
        </span>
        <h1 className="relative max-w-3xl text-balance font-[family-name:var(--font-display)] text-5xl font-medium italic tracking-tight sm:text-6xl">
          {content.heroHeading}
        </h1>
        <p className="relative mt-6 max-w-lg text-balance font-[family-name:var(--font-body)] text-[var(--site-muted)]">
          {content.heroSubheading}
        </p>
        <a
          href={`tel:${hotel.phoneNumber}`}
          className="relative mt-10 inline-flex items-center border border-[var(--site-primary)] px-8 py-3 text-xs tracking-[0.2em] text-[var(--site-primary)] uppercase transition-colors hover:bg-[var(--site-primary)] hover:text-[var(--site-primary-fg)]"
        >
          {content.ctaLabel}
        </a>
      </section>

      {/* About */}
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="text-xs tracking-[0.35em] text-[var(--site-primary)] uppercase">
          {content.aboutHeading}
        </span>
        <p className="text-balance font-[family-name:var(--font-display)] text-2xl leading-relaxed italic">
          {content.aboutBody}
        </p>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="grid grid-cols-2 gap-1 px-1 sm:grid-cols-4">
          {gallery.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url + i}
              src={url}
              alt=""
              className="aspect-3/4 w-full object-cover grayscale-[0.15]"
            />
          ))}
        </section>
      )}

      {/* Rooms — refined list */}
      {roomTypes.length > 0 && (
        <section className="mx-auto flex w-full max-w-3xl flex-col px-6 py-20">
          <h2 className="mb-10 text-center font-[family-name:var(--font-display)] text-3xl italic">
            Accommodation
          </h2>
          <div className="flex flex-col divide-y divide-[var(--site-border)]">
            {roomTypes.map((room) => (
              <div key={room.id} className="flex items-baseline justify-between gap-6 py-5">
                <div className="flex flex-col gap-1">
                  <span className="font-[family-name:var(--font-display)] text-lg">
                    {room.name}
                  </span>
                  {room.description && (
                    <span className="text-sm text-[var(--site-muted)]">{room.description}</span>
                  )}
                </div>
                <span className="shrink-0 text-sm tracking-wide text-[var(--site-primary)]">
                  {formatMoney(room.basePrice)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Menu highlights */}
      {menuItems.length > 0 && (
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 py-20">
          <h2 className="font-[family-name:var(--font-display)] text-3xl italic">
            From the kitchen
          </h2>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {menuItems.slice(0, 4).map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-2 text-center">
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="mb-2 size-20 rounded-full object-cover"
                  />
                )}
                <span className="text-sm">{item.name}</span>
                <span className="text-xs text-[var(--site-muted)]">
                  {formatMoney(item.price)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3 border-t border-[var(--site-border)] px-6 py-12 text-center text-xs text-[var(--site-muted)]">
        <span className="font-[family-name:var(--font-display)] text-lg text-[var(--site-fg)] italic">
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
        <span>
          &copy; {new Date().getFullYear()} {hotel.name}
        </span>
      </footer>
    </div>
  );
}
