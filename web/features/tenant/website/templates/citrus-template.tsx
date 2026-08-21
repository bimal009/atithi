import { MailIcon, MapPinIcon, PartyPopperIcon, PhoneIcon, SmileIcon } from "lucide-react";

import type { SiteData } from "../types";

export function CitrusTemplate({ data }: { data: SiteData; themeId: string }) {
  const { hotel, roomTypes, menuItems, formatMoney, content } = data;

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero */}
      <section className="relative flex flex-col items-center gap-6 overflow-hidden px-6 pt-16 pb-10 text-center">
        <span className="absolute top-10 left-8 -rotate-12 rounded-full bg-[var(--site-accent)] px-4 py-1.5 text-xs font-bold text-white sm:left-16">
          Welcome!
        </span>
        {hotel.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.logoUrl}
            alt={hotel.name}
            className="size-20 rounded-full border-4 border-[var(--site-primary)] bg-white object-contain p-2 shadow-lg"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-[var(--site-primary)] text-white shadow-lg">
            <SmileIcon className="size-9" />
          </div>
        )}
        <h1 className="max-w-xl text-balance font-[family-name:var(--font-display)] text-5xl font-semibold text-[var(--site-primary)]">
          {content.heroHeading}
        </h1>
        <p className="max-w-md text-balance font-[family-name:var(--font-body)] font-medium text-[var(--site-fg)]/80">
          {content.heroSubheading}
        </p>
        <a
          href={`tel:${hotel.phoneNumber}`}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-8 py-3.5 font-semibold text-white shadow-[0_6px_0_0_color-mix(in_oklab,var(--site-accent)_70%,black)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <PartyPopperIcon className="size-4" />
          {content.ctaLabel}
        </a>
      </section>

      {/* About */}
      <section className="mx-auto max-w-xl rounded-[2rem] bg-[var(--site-card)] px-8 py-8 text-center shadow-sm">
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--site-primary)]">
          {content.aboutHeading}
        </h2>
        <p className="text-[var(--site-fg)]/75">{content.aboutBody}</p>
      </section>

      {/* Rooms — chunky cards */}
      {roomTypes.length > 0 && (
        <section className="flex flex-col gap-6 px-6">
          <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--site-primary)]">
            Pick your room
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {roomTypes.map((room, i) => (
              <div
                key={room.id}
                className="flex flex-col gap-3 rounded-3xl border-4 p-6"
                style={{
                  borderColor:
                    i % 2 === 0 ? "var(--site-primary)" : "var(--site-accent)",
                  backgroundColor: "var(--site-card)",
                }}
              >
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  {room.name}
                </span>
                <span className="text-sm text-[var(--site-fg)]/70">
                  Sleeps up to {room.capacity}
                </span>
                <span className="mt-1 w-fit rounded-full bg-[var(--site-primary)] px-4 py-1 text-sm font-bold text-white">
                  {formatMoney(room.basePrice)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Food — dense colorful grid */}
      {menuItems.length > 0 && (
        <section className="flex flex-col gap-6 px-6">
          <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--site-primary)]">
            Tasty picks
          </h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {menuItems.slice(0, 8).map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-2 text-center">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-24 rounded-full border-4 border-[var(--site-card)] object-cover shadow-md"
                  />
                ) : (
                  <div className="flex size-24 items-center justify-center rounded-full bg-[var(--site-accent)]/20 text-[var(--site-accent)]">
                    <SmileIcon className="size-8" />
                  </div>
                )}
                <span className="text-sm font-semibold">{item.name}</span>
                <span className="text-xs text-[var(--site-primary)]">
                  {formatMoney(item.price)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mx-6 flex flex-col items-center gap-3 rounded-[2rem] bg-[var(--site-primary)] px-6 py-10 text-center text-white">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold">
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
