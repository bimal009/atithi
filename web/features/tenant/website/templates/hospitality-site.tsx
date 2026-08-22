"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DumbbellIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
  UtensilsIcon,
  WavesIcon,
  WifiIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Cabin } from "@/features/tenant/cabin/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";

import { EditableImage } from "../components/editable-image";
import { EditableText } from "../components/editable-text";
import { isSectionEnabled, type SiteContent, type SiteData } from "../types";

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

const FOOD_TYPE_DOT: Record<string, string> = {
  veg: "bg-emerald-500",
  vegan: "bg-emerald-600",
  "non-veg": "bg-red-500",
  egg: "bg-amber-500",
};

type Page = "home" | "rooms" | "cabins" | "gallery" | "restaurant" | "contact";

type GalleryImage = { url: string; label: string };

function ImageCarousel({
  images,
  alt,
  className,
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  if (images.length === 0) {
    return <div className={cnFallback(className)} />;
  }
  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
      <img src={images[0]} alt={alt} className={cnImg(className)} />
    );
  }
  return (
    <Carousel className={className}>
      <CarouselContent className="-ml-0">
        {images.map((url, i) => (
          <CarouselItem key={url + i} className="pl-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
            <img src={url} alt={`${alt} ${i + 1}`} className={cnImg()} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 size-7 border-[var(--site-border)] bg-[var(--site-card)]/90 text-[var(--site-fg)] hover:bg-[var(--site-card)]" />
      <CarouselNext className="right-2 size-7 border-[var(--site-border)] bg-[var(--site-card)]/90 text-[var(--site-fg)] hover:bg-[var(--site-card)]" />
    </Carousel>
  );
}

function cnImg(extra?: string) {
  return ["size-full object-cover", extra].filter(Boolean).join(" ");
}
function cnFallback(extra?: string) {
  return ["size-full bg-[var(--site-primary)]/10", extra].filter(Boolean).join(" ");
}

const TESTIMONIALS = [
  {
    quote:
      "Every detail felt considered — the room, the quiet, the way breakfast just appeared when we wanted it.",
    name: "Priya S.",
    stay: "Weekend getaway",
  },
  {
    quote:
      "We came for one night and stayed for three. The staff anticipated things before we thought to ask.",
    name: "Anish R.",
    stay: "Family trip",
  },
  {
    quote: "Simple, calm, and genuinely well run. Exactly what a good stay should feel like.",
    name: "Meera T.",
    stay: "Solo travel",
  },
];

export function HospitalitySite({
  data,
  editable = false,
  onContentChange,
}: {
  data: SiteData;
  themeId: string;
  editable?: boolean;
  onContentChange?: (patch: Partial<SiteContent>) => void;
}) {
  const { hotel, roomTypes, cabins, menuItems, galleryImages, content, formatMoney } = data;
  const [page, setPage] = React.useState<Page>("home");
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const set = React.useCallback(
    (key: keyof SiteContent) => (value: string) => onContentChange?.({ [key]: value }),
    [onContentChange],
  );

  const showRooms = isSectionEnabled(content, "rooms") && roomTypes.length > 0;
  const showCabins = isSectionEnabled(content, "cabins") && cabins.length > 0;
  const showRestaurant = isSectionEnabled(content, "restaurant") && menuItems.length > 0;
  const showTestimonials = isSectionEnabled(content, "testimonials");
  const showContact = isSectionEnabled(content, "contact");

  const gallery: GalleryImage[] = React.useMemo(
    () => galleryImages.map((url) => ({ url, label: hotel.name })),
    [galleryImages, hotel.name],
  );
  const showGallery = isSectionEnabled(content, "gallery") && gallery.length > 0;

  const amenityPool = [...new Set(roomTypes.flatMap((r) => r.amenities))].slice(0, 4);

  const categories = React.useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const list = map.get(item.categoryName) ?? [];
      list.push(item);
      map.set(item.categoryName, list);
    }
    return [...map.entries()];
  }, [menuItems]);
  const topPicks = menuItems.filter((m) => m.isTopPick);

  const NAV: { id: Page; label: string }[] = [
    { id: "home", label: "Home" },
    ...(showRooms ? [{ id: "rooms" as const, label: "Rooms" }] : []),
    ...(showCabins ? [{ id: "cabins" as const, label: "Cabins" }] : []),
    ...(showGallery ? [{ id: "gallery" as const, label: "Gallery" }] : []),
    ...(showRestaurant ? [{ id: "restaurant" as const, label: "Restaurant" }] : []),
    { id: "contact", label: "Contact" },
  ];

  function goTo(target: Page) {
    setPage(target);
    setMobileNavOpen(false);
  }

  function RoomCard({ room }: { room: RoomType }) {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)]">
        <div className="aspect-4/3">
          <ImageCarousel images={room.images} alt={room.name} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {room.name}
          </span>
          {room.description && (
            <p className="line-clamp-2 text-sm text-[var(--site-muted)]">{room.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--site-muted)]">
            <span className="flex items-center gap-1">
              <UsersIcon className="size-3.5" />
              Up to {room.capacity} guests
            </span>
            {room.pricingLabel && <span>{room.pricingLabel}</span>}
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--site-primary)]">
              {formatMoney(room.basePrice)}
              <span className="ml-1 text-xs font-normal text-[var(--site-muted)]">/ night</span>
            </span>
            <Button
              size="sm"
              className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
              onClick={() => goTo("contact")}
            >
              Book now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function CabinCard({ cabin }: { cabin: Cabin }) {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)]">
        <div className="aspect-4/3">
          <ImageCarousel images={cabin.images} alt={cabin.name} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {cabin.name}
          </span>
          {cabin.description && (
            <p className="line-clamp-2 text-sm text-[var(--site-muted)]">{cabin.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--site-muted)]">
            <span className="flex items-center gap-1">
              <UsersIcon className="size-3.5" />
              Up to {cabin.capacity} guests
            </span>
          </div>
          {cabin.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cabin.amenities.slice(0, 3).map((a) => (
                <Badge key={a} variant="outline" className="border-[var(--site-border)] text-xs">
                  {a}
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--site-primary)]">
              {formatMoney(cabin.basePrice)}
              <span className="ml-1 text-xs font-normal text-[var(--site-muted)]">/ night</span>
            </span>
            <Button
              size="sm"
              className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
              onClick={() => goTo("contact")}
            >
              Reserve
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--site-border)] bg-[var(--site-bg)]/95 px-6 py-4 backdrop-blur sm:px-10">
        <button
          type="button"
          onClick={() => goTo("home")}
          className="cursor-pointer font-[family-name:var(--font-display)] text-lg font-semibold"
        >
          {hotel.name}
        </button>

        <div className="hidden items-center gap-7 text-sm md:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className={
                page === item.id
                  ? "font-medium text-[var(--site-primary)]"
                  : "cursor-pointer text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90 sm:inline-flex"
            onClick={() => goTo("contact")}
          >
            <EditableText
              value={content.ctaPrimaryLabel}
              onChange={editable ? set("ctaPrimaryLabel") : undefined}
              editable={editable}
            />
          </Button>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Menu">
                  <MenuIcon />
                </Button>
              }
            />
            <SheetContent side="right" className="p-0">
              <SheetTitle className="sr-only">Site navigation</SheetTitle>
              <div className="flex flex-col gap-1 p-6">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(item.id)}
                    className={
                      page === item.id
                        ? "rounded-lg bg-muted px-3 py-2.5 text-left font-medium"
                        : "cursor-pointer rounded-lg px-3 py-2.5 text-left text-muted-foreground hover:bg-muted"
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {page === "home" && (
        <div className="flex flex-col">
          {/* Hero */}
          <section className="px-6 pt-8 sm:px-10">
            <div className="relative overflow-hidden rounded-[2rem]">
              <EditableImage
                src={content.heroImageUrl || hotel.logoUrl}
                editable={editable}
                onChange={(url) => onContentChange?.({ heroImageUrl: url })}
                folder="/hotel-website"
                className="min-h-[32rem] w-full sm:min-h-[38rem]"
                fallback={<div className="size-full bg-[var(--site-primary)]/15" />}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-8 text-white sm:p-14">
                <EditableText
                  value={content.heroEyebrow}
                  onChange={editable ? set("heroEyebrow") : undefined}
                  editable={editable}
                  as="span"
                  className="text-xs font-medium tracking-[0.2em] text-white/80 uppercase"
                />
                <EditableText
                  value={content.heroHeading}
                  onChange={editable ? set("heroHeading") : undefined}
                  editable={editable}
                  as="h1"
                  className="max-w-2xl text-balance font-[family-name:var(--font-display)] text-4xl leading-[1.05] font-semibold sm:text-6xl"
                />
                <EditableText
                  value={content.heroSubheading}
                  onChange={editable ? set("heroSubheading") : undefined}
                  editable={editable}
                  as="p"
                  multiline
                  className="max-w-lg text-balance text-white/85"
                />
                <div className="mt-2 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="rounded-full bg-white text-black hover:bg-white/90"
                    onClick={() => goTo("contact")}
                  >
                    <EditableText
                      value={content.ctaPrimaryLabel}
                      onChange={editable ? set("ctaPrimaryLabel") : undefined}
                      editable={editable}
                    />
                  </Button>
                  {showRooms && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white/50 bg-transparent text-white hover:bg-white/10"
                      onClick={() => goTo("rooms")}
                    >
                      <EditableText
                        value={content.ctaSecondaryLabel}
                        onChange={editable ? set("ctaSecondaryLabel") : undefined}
                        editable={editable}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Decorative availability search */}
            <div className="relative z-10 mx-4 -mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--site-card)] p-5 shadow-xl ring-1 ring-[var(--site-border)] sm:mx-10 sm:-mt-9 sm:grid-cols-5 sm:items-end">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--site-muted)]">Check-in</span>
                <Input type="date" className="bg-transparent" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--site-muted)]">Check-out</span>
                <Input type="date" className="bg-transparent" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--site-muted)]">Guests</span>
                <Input type="number" min={1} defaultValue={2} className="bg-transparent" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--site-muted)]">Rooms</span>
                <Input type="number" min={1} defaultValue={1} className="bg-transparent" />
              </div>
              <Button
                className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
                onClick={() => goTo("contact")}
              >
                Search availability
              </Button>
            </div>
          </section>

          {/* About */}
          <section className="grid grid-cols-1 items-center gap-8 px-6 py-16 sm:grid-cols-2 sm:gap-12 sm:px-10">
            <EditableImage
              src={content.aboutImageUrl || gallery[0]?.url}
              editable={editable}
              onChange={(url) => onContentChange?.({ aboutImageUrl: url })}
              folder="/hotel-website"
              className="aspect-4/5 overflow-hidden rounded-2xl"
            />
            <div className="flex flex-col gap-4">
              <EditableText
                value={content.aboutHeading}
                onChange={editable ? set("aboutHeading") : undefined}
                editable={editable}
                as="h2"
                className="font-[family-name:var(--font-display)] text-3xl font-semibold"
              />
              <EditableText
                value={content.aboutBody}
                onChange={editable ? set("aboutBody") : undefined}
                editable={editable}
                as="p"
                multiline
                className="text-[var(--site-muted)]"
              />
              {amenityPool.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {amenityPool.map((a) => {
                    const Icon = amenityIcon(a);
                    return (
                      <div key={a} className="flex items-center gap-2.5 text-sm">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--site-primary)]/10 text-[var(--site-primary)]">
                          <Icon className="size-4" />
                        </span>
                        {a}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Rooms preview */}
          {showRooms && (
            <section className="flex flex-col gap-8 border-t border-[var(--site-border)] px-6 py-16 sm:px-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <EditableText
                    value={content.roomsHeading}
                    onChange={editable ? set("roomsHeading") : undefined}
                    editable={editable}
                    as="h2"
                    className="font-[family-name:var(--font-display)] text-3xl font-semibold"
                  />
                  <EditableText
                    value={content.roomsSubheading}
                    onChange={editable ? set("roomsSubheading") : undefined}
                    editable={editable}
                    as="p"
                    className="text-[var(--site-muted)]"
                  />
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
                  onClick={() => goTo("rooms")}
                >
                  View all rooms
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {roomTypes.slice(0, 3).map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </section>
          )}

          {/* Cabins preview */}
          {showCabins && (
            <section className="flex flex-col gap-8 border-t border-[var(--site-border)] px-6 py-16 sm:px-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <EditableText
                    value={content.cabinsHeading}
                    onChange={editable ? set("cabinsHeading") : undefined}
                    editable={editable}
                    as="h2"
                    className="font-[family-name:var(--font-display)] text-3xl font-semibold"
                  />
                  <EditableText
                    value={content.cabinsSubheading}
                    onChange={editable ? set("cabinsSubheading") : undefined}
                    editable={editable}
                    as="p"
                    className="text-[var(--site-muted)]"
                  />
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
                  onClick={() => goTo("cabins")}
                >
                  View all cabins
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {cabins.slice(0, 3).map((cabin) => (
                  <CabinCard key={cabin.id} cabin={cabin} />
                ))}
              </div>
            </section>
          )}

          {/* Gallery preview */}
          {showGallery && (
            <section className="flex flex-col gap-8 border-t border-[var(--site-border)] px-6 py-16 sm:px-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <EditableText
                  value={content.galleryHeading}
                  onChange={editable ? set("galleryHeading") : undefined}
                  editable={editable}
                  as="h2"
                  className="font-[family-name:var(--font-display)] text-3xl font-semibold"
                />
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
                  onClick={() => goTo("gallery")}
                >
                  View full gallery
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {gallery.slice(0, 8).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                  <img
                    key={img.url + i}
                    src={img.url}
                    alt={img.label}
                    className={
                      i % 5 === 0
                        ? "col-span-2 row-span-2 aspect-square rounded-xl object-cover sm:aspect-auto sm:h-full"
                        : "aspect-square rounded-xl object-cover"
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Restaurant preview */}
          {showRestaurant && (
            <section className="grid grid-cols-1 items-center gap-8 border-t border-[var(--site-border)] px-6 py-16 sm:grid-cols-2 sm:gap-12 sm:px-10">
              <div className="aspect-4/3 overflow-hidden rounded-2xl">
                {menuItems.find((m) => m.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                  <img
                    src={menuItems.find((m) => m.imageUrl)!.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-[var(--site-primary)]/10" />
                )}
              </div>
              <div className="flex flex-col gap-4">
                <EditableText
                  value={content.restaurantHeading}
                  onChange={editable ? set("restaurantHeading") : undefined}
                  editable={editable}
                  as="h2"
                  className="font-[family-name:var(--font-display)] text-3xl font-semibold"
                />
                <EditableText
                  value={content.restaurantSubheading}
                  onChange={editable ? set("restaurantSubheading") : undefined}
                  editable={editable}
                  as="p"
                  className="text-[var(--site-muted)]"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
                    onClick={() => goTo("restaurant")}
                  >
                    View menu
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
                    onClick={() => goTo("contact")}
                  >
                    Reserve a table
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Testimonials */}
          {showTestimonials && (
            <section className="flex flex-col gap-8 border-t border-[var(--site-border)] px-6 py-16 sm:px-10">
              <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold">
                What guests say
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.name}
                    className="flex flex-col gap-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-6"
                  >
                    <div className="flex gap-0.5 text-[var(--site-primary)]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-[var(--site-fg)]">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-auto flex flex-col text-sm">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-xs text-[var(--site-muted)]">{t.stay}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Final CTA */}
          {showContact && (
            <section className="flex flex-col items-center gap-5 border-t border-[var(--site-border)] px-6 py-20 text-center sm:px-10">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
                Your stay starts here.
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
                  onClick={() => goTo("contact")}
                >
                  Check availability
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
                  onClick={() => goTo("contact")}
                >
                  Contact us
                </Button>
              </div>
            </section>
          )}
        </div>
      )}

      {page === "rooms" && showRooms && (
        <div className="flex flex-col gap-8 px-6 py-14 sm:px-10">
          <div className="flex flex-col gap-2">
            <EditableText
              value={content.roomsHeading}
              onChange={editable ? set("roomsHeading") : undefined}
              editable={editable}
              as="h1"
              className="font-[family-name:var(--font-display)] text-4xl font-semibold"
            />
            <EditableText
              value={content.roomsSubheading}
              onChange={editable ? set("roomsSubheading") : undefined}
              editable={editable}
              as="p"
              className="text-[var(--site-muted)]"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      )}

      {page === "cabins" && showCabins && (
        <div className="flex flex-col gap-8 px-6 py-14 sm:px-10">
          <div className="flex flex-col gap-2">
            <EditableText
              value={content.cabinsHeading}
              onChange={editable ? set("cabinsHeading") : undefined}
              editable={editable}
              as="h1"
              className="font-[family-name:var(--font-display)] text-4xl font-semibold"
            />
            <EditableText
              value={content.cabinsSubheading}
              onChange={editable ? set("cabinsSubheading") : undefined}
              editable={editable}
              as="p"
              className="text-[var(--site-muted)]"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cabins.map((cabin) => (
              <CabinCard key={cabin.id} cabin={cabin} />
            ))}
          </div>
        </div>
      )}

      {page === "gallery" && showGallery && (
        <div className="flex flex-col gap-8 px-6 py-14 sm:px-10">
          <EditableText
            value={content.galleryHeading}
            onChange={editable ? set("galleryHeading") : undefined}
            editable={editable}
            as="h1"
            className="font-[family-name:var(--font-display)] text-4xl font-semibold"
          />
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
            {gallery.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="block w-full cursor-pointer overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                <img src={img.url} alt={img.label} className="w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {page === "restaurant" && showRestaurant && (
        <div className="flex flex-col gap-10 px-6 py-14 sm:px-10">
          <div className="flex flex-col gap-2">
            <EditableText
              value={content.restaurantHeading}
              onChange={editable ? set("restaurantHeading") : undefined}
              editable={editable}
              as="h1"
              className="font-[family-name:var(--font-display)] text-4xl font-semibold"
            />
            <EditableText
              value={content.restaurantSubheading}
              onChange={editable ? set("restaurantSubheading") : undefined}
              editable={editable}
              as="p"
              className="text-[var(--site-muted)]"
            />
            <Button
              className="mt-2 w-fit rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
              onClick={() => goTo("contact")}
            >
              Reserve a table
            </Button>
          </div>

          {topPicks.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                <StarIcon className="size-4 fill-[var(--site-primary)] text-[var(--site-primary)]" />
                Chef&apos;s picks
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {topPicks.map((item) => (
                  <div
                    key={item.id}
                    className="flex w-56 shrink-0 flex-col gap-2 rounded-xl border border-[var(--site-border)] bg-[var(--site-card)] p-4"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-[var(--site-primary)]">{formatMoney(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-10">
            {categories.map(([categoryName, items]) => (
              <div key={categoryName} id={categoryName} className="flex flex-col gap-4">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {categoryName}
                </h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 font-medium">
                          <span
                            className={`size-2 shrink-0 rounded-full ${FOOD_TYPE_DOT[item.foodType] ?? "bg-muted-foreground"}`}
                          />
                          {item.name}
                          {item.isTopPick && (
                            <Badge className="bg-[var(--site-primary)] text-[var(--site-primary-fg)]">
                              Top pick
                            </Badge>
                          )}
                        </span>
                        {item.description && (
                          <p className="max-w-sm text-sm text-[var(--site-muted)]">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 font-medium text-[var(--site-primary)]">
                        {formatMoney(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "contact" && showContact && (
        <div className="flex flex-col gap-10 px-6 py-14 sm:px-10">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
            <EditableText
              value={content.contactHeading}
              onChange={editable ? set("contactHeading") : undefined}
              editable={editable}
              as="h1"
              className="font-[family-name:var(--font-display)] text-4xl font-semibold"
            />
            <EditableText
              value={content.contactBody}
              onChange={editable ? set("contactBody") : undefined}
              editable={editable}
              as="p"
              multiline
              className="text-[var(--site-muted)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-[var(--site-card)] text-[var(--site-muted)]">
              <MapPinIcon className="size-8" />
            </div>

            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                toast.info(
                  "This form isn't connected yet — reach out directly using the details below.",
                );
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Name" />
                <Input placeholder="Email" type="email" />
              </div>
              <Input placeholder="Phone" />
              <Input placeholder="Subject" />
              <Textarea placeholder="Message" rows={4} />
              <Button
                type="submit"
                className="w-fit rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:opacity-90"
              >
                Send message
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 border-t border-[var(--site-border)] pt-8 text-sm text-[var(--site-muted)]">
            {hotel.address && (
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="size-4" />
                {hotel.address}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <PhoneIcon className="size-4" />
              {hotel.phoneNumber}
            </span>
            {hotel.email && (
              <span className="flex items-center gap-1.5">
                <MailIcon className="size-4" />
                {hotel.email}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto flex flex-col items-center gap-3 border-t border-[var(--site-border)] px-6 py-10 text-center text-sm text-[var(--site-muted)]">
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

      {/* Gallery lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-3xl border-none bg-transparent p-0 shadow-none ring-0"
        >
          <DialogTitle className="sr-only">Gallery image</DialogTitle>
          {lightboxIndex !== null && gallery[lightboxIndex] && (
            <div className="relative flex flex-col gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
              <img
                src={gallery[lightboxIndex].url}
                alt={gallery[lightboxIndex].label}
                className="max-h-[75vh] w-full rounded-xl object-contain"
              />
              <div className="flex items-center justify-between text-sm text-white">
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-black/50 px-3 py-1.5"
                  onClick={() =>
                    setLightboxIndex((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length))
                  }
                >
                  <ChevronLeftIcon className="size-4" /> Prev
                </button>
                <span className="rounded-full bg-black/50 px-3 py-1.5">
                  {lightboxIndex + 1} / {gallery.length}
                </span>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-black/50 px-3 py-1.5"
                  onClick={() => setLightboxIndex((i) => (i === null ? null : (i + 1) % gallery.length))}
                >
                  Next <ChevronRightIcon className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Close"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
