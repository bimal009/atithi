import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CalendarCheckIcon, HandCoinsIcon, MessageCircleIcon, StarIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GalleryBento2 } from "@/features/site/v2/components/gallery-bento-2";
import { HeroSearchWidget2 } from "@/features/site/v2/components/hero-search-widget-2";
import { SiteShell2 } from "@/features/site/v2/components/site-shell-2";
import { StayCard2 } from "@/features/site/v2/components/stay-card-2";
import {
  dummyCabins,
  dummyHotel,
  dummyRooms,
  dummyTestimonials,
  formatMoney,
} from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return {
    title: dummyHotel.name,
    description: dummyHotel.description,
  };
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2.5 text-xs font-medium tracking-[0.14em] text-[#17181A]/45 uppercase lg:flex-col lg:items-start lg:gap-3">
      <span className="text-[#4B5D46]">{index}</span>
      <span className="h-px w-6 bg-[#17181A]/20 lg:w-10" />
      {children}
    </span>
  );
}

function Rail({ index, label, children }: { index: string; label: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[200px_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionLabel index={index}>{label}</SectionLabel>
      </div>
      {children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-[family-name:var(--font-site2-display)] text-2xl font-semibold text-[#4B5D46]">
        {value}
      </span>
      <span className="text-xs tracking-wide text-[#17181A]/50 uppercase">{label}</span>
    </div>
  );
}

export default async function TenantSitePage2({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const basePath = `/s/${tenant}/2`;

  const topPicks = [
    ...dummyRooms.filter((r) => r.isTopPick).map((r) => ({ ...r, kind: "rooms" as const })),
    ...dummyCabins.filter((c) => c.isTopPick).map((c) => ({ ...c, kind: "cabins" as const })),
  ].slice(0, 4);

  return (
    <SiteShell2 tenant={tenant} active="home">
      {/* Hero — split layout, distinct from Template 1's full-bleed banner */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 sm:pb-28 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <span className="flex items-center gap-2.5 text-xs font-medium tracking-[0.14em] text-[#17181A]/45 uppercase">
              <span className="text-[#4B5D46]">01</span>
              <span className="h-px w-6 bg-[#17181A]/20" />
              {dummyHotel.address}
            </span>
            <h1 className="max-w-xl text-balance font-[family-name:var(--font-site2-display)] text-4xl leading-[1.12] font-semibold sm:text-5xl lg:text-6xl">
              {dummyHotel.tagline}
            </h1>
            <p className="max-w-md text-[#17181A]/60">{dummyHotel.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-6">
              <Button
                size="lg"
                className="rounded-sm bg-[#17181A] px-6 text-white hover:bg-[#17181A]/85"
                nativeButton={false}
                render={<Link href={`${basePath}/rooms`} />}
              >
                Book your stay
              </Button>
              <Link
                href={`${basePath}/cabins`}
                className="group flex items-center gap-1.5 text-sm font-medium text-[#17181A]"
              >
                Explore cabins
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
          </div>
          <div className="aspect-4/5 w-full overflow-hidden rounded-sm sm:aspect-3/4 lg:aspect-4/5">
            {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
            <img src={dummyHotel.heroImage} alt={dummyHotel.name} className="size-full object-cover" />
          </div>
        </div>

        <div className="mt-12 border-t border-[#17181A]/10 pt-10 sm:mt-16">
          <HeroSearchWidget2 basePath={basePath} />
        </div>
      </section>

      {/* Why book direct */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-20 sm:grid-cols-3 sm:px-6 sm:py-28 lg:px-10">
        {[
          {
            Icon: HandCoinsIcon,
            title: "Direct rates",
            body: "No third-party booking fees — you deal with us directly.",
          },
          {
            Icon: MessageCircleIcon,
            title: "Personal service",
            body: "Reach us on WhatsApp or by phone and we'll sort out the details.",
          },
          {
            Icon: CalendarCheckIcon,
            title: "Flexible dates",
            body: "Check availability and we'll confirm what works for your stay.",
          },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-3">
            <Icon className="size-5 text-[#4B5D46]" strokeWidth={1.5} />
            <span className="font-[family-name:var(--font-site2-display)] text-base font-semibold">{title}</span>
            <span className="text-sm text-[#17181A]/55">{body}</span>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="border-t border-[#17181A]/10 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <Rail index="02" label="About us">
          <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[0.9fr_1.1fr] sm:gap-14">
            {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
            <img
              src={dummyHotel.aboutImage}
              alt="About the property"
              className="aspect-4/5 w-full rounded-sm object-cover"
            />
            <div className="flex flex-col gap-5">
              <h2 className="max-w-lg text-balance font-[family-name:var(--font-site2-display)] text-3xl font-semibold sm:text-4xl">
                A quiet standard of care, kept the same for every guest
              </h2>
              <p className="max-w-lg text-[#17181A]/60">{dummyHotel.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-6 border-t border-[#17181A]/10 pt-6">
                <Stat value="6" label="Rooms" />
                <Stat value="3" label="Cabins" />
                <Stat value="24/7" label="WhatsApp support" />
              </div>
            </div>
          </div>
        </Rail>
      </section>

      {/* Gallery */}
      <section className="border-t border-[#17181A]/10 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <Rail index="03" label="Gallery">
          <GalleryBento2 />
        </Rail>
      </section>

      {/* Top picks */}
      {topPicks.length > 0 && (
        <section className="border-t border-[#17181A]/10 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <Rail index="04" label="Top picks">
            <div className="flex flex-col gap-10">
              <h2 className="font-[family-name:var(--font-site2-display)] text-3xl font-semibold sm:text-4xl">
                Guest favorites
              </h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {topPicks.map((item) => (
                  <Link key={item.id} href={`${basePath}/${item.kind}/${item.id}`} className="group flex flex-col gap-3">
                    <div className="aspect-square overflow-hidden rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="size-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="line-clamp-1 font-[family-name:var(--font-site2-display)] font-semibold group-hover:text-[#4B5D46]">
                        {item.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#17181A]/50">
                        <UsersIcon className="size-3.5" strokeWidth={1.75} />
                        Up to {item.capacity} guests
                      </span>
                      <span className="mt-0.5 text-sm font-semibold text-[#4B5D46]">
                        {formatMoney(item.basePrice)}
                        <span className="ml-1 text-xs font-normal text-[#17181A]/50">/ night</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Rail>
        </section>
      )}

      {/* Rooms preview */}
      <section className="border-t border-[#17181A]/10 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <Rail index="05" label="Rooms">
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-[family-name:var(--font-site2-display)] text-3xl font-semibold sm:text-4xl">
                Considered spaces
              </h2>
              <Link
                href={`${basePath}/rooms`}
                className="group flex items-center gap-1.5 text-sm font-medium text-[#17181A]"
              >
                View all rooms
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {dummyRooms.slice(0, 3).map((room) => (
                <StayCard2 key={room.id} stay={room} basePath={basePath} kind="rooms" />
              ))}
            </div>
          </div>
        </Rail>
      </section>

      {/* Cabins preview */}
      <section className="border-t border-[#17181A]/10 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <Rail index="06" label="Cabins">
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-[family-name:var(--font-site2-display)] text-3xl font-semibold sm:text-4xl">
                Room to breathe
              </h2>
              <Link
                href={`${basePath}/cabins`}
                className="group flex items-center gap-1.5 text-sm font-medium text-[#17181A]"
              >
                View all cabins
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {dummyCabins.map((cabin) => (
                <StayCard2 key={cabin.id} stay={cabin} basePath={basePath} kind="cabins" />
              ))}
            </div>
          </div>
        </Rail>
      </section>

      {/* Testimonials */}
      <section className="border-t border-[#17181A]/10 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <Rail index="07" label="What guests say">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {dummyTestimonials.map((t) => (
              <div key={t.name} className="flex flex-col gap-4">
                <div className="flex gap-0.5 text-[#4B5D46]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-[15px] text-[#17181A]/75">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto flex flex-col text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-xs text-[#17181A]/45">{t.stay}</span>
                </div>
              </div>
            ))}
          </div>
        </Rail>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center gap-6 border-t border-[#17181A]/10 bg-[#17181A] px-4 py-20 text-center text-white sm:px-6 sm:py-28 lg:px-10">
        <h2 className="font-[family-name:var(--font-site2-display)] text-3xl font-semibold sm:text-4xl">
          Your stay starts here.
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Button
            size="lg"
            className="rounded-sm bg-white px-6 text-[#17181A] hover:bg-white/90"
            nativeButton={false}
            render={<Link href={`${basePath}/rooms`} />}
          >
            Check availability
          </Button>
          <Link href={`${basePath}/contact`} className="text-sm font-medium text-white/70 hover:text-white">
            Contact us
          </Link>
        </div>
      </section>
    </SiteShell2>
  );
}
