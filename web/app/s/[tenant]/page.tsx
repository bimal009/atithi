import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheckIcon, HandCoinsIcon, MessageCircleIcon, StarIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GalleryBento } from "@/features/site/components/gallery-bento";
import { HeroSearchWidget } from "@/features/site/components/home/hero-search-widget";
import { SiteShell } from "@/features/site/components/site-shell";
import { StayCard } from "@/features/site/components/stay-card";
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

export default async function TenantSitePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const basePath = `/s/${tenant}`;

  const topPicks = [
    ...dummyRooms.filter((r) => r.isTopPick).map((r) => ({ ...r, kind: "rooms" as const })),
    ...dummyCabins.filter((c) => c.isTopPick).map((c) => ({ ...c, kind: "cabins" as const })),
  ].slice(0, 4);

  return (
    <SiteShell tenant={tenant} active="home">
      {/* Hero */}
      <section className="px-4 pt-6 pb-16 sm:px-6 sm:pb-20 lg:px-10">
        <div className="relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-[2rem] sm:min-h-[32rem] lg:min-h-[38rem]">
          {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
          <img
            src={dummyHotel.heroImage}
            alt={dummyHotel.name}
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
          <div className="flex flex-col gap-4 p-6 text-white sm:p-10 lg:p-14">
            <span className="text-xs font-medium tracking-[0.2em] text-white/80 uppercase">
              {dummyHotel.address}
            </span>
            <h1 className="max-w-2xl text-balance font-[family-name:var(--font-site-display)] text-4xl leading-[1.05] font-semibold sm:text-6xl">
              {dummyHotel.tagline}
            </h1>
            <p className="max-w-lg text-balance text-white/85 sm:text-lg">{dummyHotel.description}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full bg-white px-6 text-black hover:bg-white/90"
                nativeButton={false}
                render={<Link href={`${basePath}/rooms`} />}
              >
                Book your stay
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/50 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                nativeButton={false}
                render={<Link href={`${basePath}/cabins`} />}
              >
                Explore cabins
              </Button>
            </div>
          </div>
        </div>

        <HeroSearchWidget basePath={basePath} />
      </section>

      {/* Why book direct */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-16 text-center sm:grid-cols-3 sm:px-6 sm:py-20 lg:px-10">
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
          <div key={title} className="flex flex-col items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-amber-700/10 text-amber-800">
              <Icon className="size-5" />
            </span>
            <span className="font-medium text-stone-900">{title}</span>
            <span className="max-w-56 text-sm text-stone-500">{body}</span>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 sm:grid-cols-2 sm:gap-12 sm:px-6 sm:py-20 lg:px-10">
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
        <img
          src={dummyHotel.aboutImage}
          alt="About the property"
          className="aspect-4/5 w-full rounded-2xl object-cover"
        />
        <div className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
            About us
          </h2>
          <p className="text-stone-600">{dummyHotel.description}</p>
          <div className="mt-2 grid grid-cols-2 gap-4">
            {["Free Wi-Fi throughout", "Farm-to-table kitchen", "Airport pickup on request", "Pet friendly"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-stone-700">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-700/10 text-amber-800">
                    <StarIcon className="size-4" />
                  </span>
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="border-t border-stone-200 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-amber-800 uppercase">
            Gallery
          </span>
          <GalleryBento />
        </div>
      </section>

      {/* Top picks */}
      {topPicks.length > 0 && (
        <section className="border-t border-stone-200 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-amber-800 uppercase">
                  <StarIcon className="size-3.5 fill-current" />
                  Top picks
                </span>
                <h2 className="font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
                  Guest favorites
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topPicks.map((item) => {
                return (
                  <Link
                    key={item.id}
                    href={`${basePath}/${item.kind}/${item.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 transition-shadow hover:shadow-lg hover:shadow-stone-900/5"
                  >
                    <div className="aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="size-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <span className="line-clamp-1 font-medium text-stone-900">{item.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-stone-500">
                        <UsersIcon className="size-3.5" />
                        Up to {item.capacity} guests
                      </span>
                      <span className="mt-1 text-sm font-semibold text-amber-800">
                        {formatMoney(item.basePrice)}
                        <span className="ml-1 text-xs font-normal text-stone-500">/ night</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Rooms preview */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
              Rooms
            </h2>
            <p className="text-stone-500">Considered spaces, dressed simply, built for rest.</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900"
            nativeButton={false}
            render={<Link href={`${basePath}/rooms`} />}
          >
            View all rooms
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyRooms.slice(0, 3).map((room) => (
            <StayCard key={room.id} stay={room} basePath={basePath} kind="rooms" />
          ))}
        </div>
      </section>

      {/* Cabins preview */}
      <section className="border-t border-stone-200 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
                Cabins
              </h2>
              <p className="text-stone-500">For guests who want a little more room to breathe.</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900"
              nativeButton={false}
              render={<Link href={`${basePath}/cabins`} />}
            >
              View all cabins
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dummyCabins.map((cabin) => (
              <StayCard key={cabin.id} stay={cabin} basePath={basePath} kind="cabins" />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <h2 className="text-center font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
          What guests say
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {dummyTestimonials.map((t) => (
            <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex gap-0.5 text-amber-700">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-stone-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-auto flex flex-col text-sm">
                <span className="font-medium text-stone-900">{t.name}</span>
                <span className="text-xs text-stone-500">{t.stay}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center gap-5 border-t border-stone-200 bg-white px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-10">
        <h2 className="font-[family-name:var(--font-site-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
          Your stay starts here.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="rounded-full bg-amber-700 px-6 text-white hover:bg-amber-800"
            nativeButton={false}
            render={<Link href={`${basePath}/rooms`} />}
          >
            Check availability
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-stone-300 bg-transparent px-6 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
            nativeButton={false}
            render={<Link href={`${basePath}/contact`} />}
          >
            Contact us
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
