"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CheckIcon,
  HandCoinsIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  MessageCircleIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  ShoppingBagIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Cabin } from "@/features/tenant/cabin/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";

import { EditableImage } from "../components/editable-image";
import { EditableText } from "../components/editable-text";
import {
  homeSectionOrder,
  isSectionEnabled,
  type HomeSectionId,
  type Page,
  type SiteContent,
  type TemplateComponentProps,
} from "../types";
import {
  FOOD_TYPE_DOT,
  GalleryBento,
  TESTIMONIALS,
  WhatsAppIcon,
  googleMapEmbedSrc,
  pageHref,
  parseLatLng,
  waLink,
} from "./shared";

function StayCard({
  stay,
  kind,
  basePath,
  formatMoney,
}: {
  stay: RoomType | Cabin;
  kind: "rooms" | "cabins";
  basePath?: string;
  formatMoney: (amount: number) => string;
}) {
  const href = pageHref(basePath, kind === "rooms" ? "room-detail" : "cabin-detail", stay.id);
  return (
    <div className="group flex flex-col gap-3">
      <div className="block aspect-4/3 overflow-hidden rounded-sm bg-[var(--site-primary)]/10">
        {stay.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
          <img src={stay.images[0]} alt={stay.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <span className="line-clamp-1 font-[family-name:var(--font-display)] text-lg font-semibold">{stay.name}</span>
        {stay.description && <p className="line-clamp-2 min-h-10 text-sm text-[var(--site-muted)]">{stay.description}</p>}
        <span className="flex items-center gap-1.5 text-xs text-[var(--site-muted)]">
          <UsersIcon className="size-3.5" strokeWidth={1.75} />
          Up to {stay.capacity} guests
        </span>
        <div className="mt-1 flex items-center justify-between border-t border-[var(--site-border)] pt-3">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--site-primary)]">
            {formatMoney(stay.basePrice)}
            <span className="ml-1 text-xs font-normal text-[var(--site-muted)]">/ night</span>
          </span>
          <div className="flex items-center gap-4">
            {basePath && (
              <Link href={href} className="text-sm font-medium text-[var(--site-muted)] hover:text-[var(--site-fg)]">
                Details
              </Link>
            )}
            <Button
              size="sm"
              className="rounded-sm bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
              nativeButton={!basePath}
              render={basePath ? <Link href={href} /> : undefined}
            >
              Book now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2.5 text-xs font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase lg:flex-col lg:items-start lg:gap-3">
      <span className="text-[var(--site-primary)]">{index}</span>
      <span className="h-px w-6 bg-[var(--site-border)] lg:w-10" />
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

export function MinimalTemplate({
  data,
  editable = false,
  onContentChange,
  page: controlledPage,
  basePath,
  detailId,
}: TemplateComponentProps) {
  const { hotel, roomTypes, cabins, menuItems, galleryImages, mapUrl, content, formatMoney } = data;
  const coords = React.useMemo(() => parseLatLng(mapUrl), [mapUrl]);
  const router = useRouter();
  const [internalPage, setInternalPage] = React.useState<Page>("home");
  const page = controlledPage ?? internalPage;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [activeImage, setActiveImage] = React.useState(0);
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guests, setGuests] = React.useState(2);
  const [tbDate, setTbDate] = React.useState("");
  const [tbTime, setTbTime] = React.useState("19:30");
  const [tbGuests, setTbGuests] = React.useState("2");
  const [tbSeating, setTbSeating] = React.useState("No preference");

  const set = React.useCallback(
    (key: keyof SiteContent) => (value: string) => onContentChange?.({ [key]: value }),
    [onContentChange],
  );
  const setStyle = React.useCallback(
    (styleId: string, patch: Partial<NonNullable<SiteContent["textStyles"]>[string]>) => {
      onContentChange?.({ textStyles: { ...content.textStyles, [styleId]: patch } });
    },
    [content.textStyles, onContentChange],
  );

  const logoDisplay = content.logoDisplay ?? "both";
  const showRooms = isSectionEnabled(content, "rooms");
  const showCabins = isSectionEnabled(content, "cabins") && cabins.length > 0;
  const showRestaurant = isSectionEnabled(content, "restaurant") && menuItems.length > 0;
  const showTestimonials = isSectionEnabled(content, "testimonials");
  const showGallery = isSectionEnabled(content, "gallery") && galleryImages.length > 0;
  const topPickRooms = roomTypes.filter((r) => r.isTopPick);

  const categories = React.useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const list = map.get(item.categoryName) ?? [];
      list.push(item);
      map.set(item.categoryName, list);
    }
    return [...map.entries()];
  }, [menuItems]);
  const topPickDishes = menuItems.filter((m) => m.isTopPick);

  function effectivePrice(item: MenuItem) {
    return Math.max(item.price - (item.discount ?? 0), 0);
  }
  function setQty(itemId: string, qty: number) {
    setCart((c) => {
      if (qty <= 0) {
        const next = { ...c };
        delete next[itemId];
        return next;
      }
      return { ...c, [itemId]: qty };
    });
  }
  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => ({ item: menuItems.find((m) => m.id === id), qty }))
    .filter((e): e is { item: MenuItem; qty: number } => !!e.item);
  const cartCount = cartEntries.reduce((sum, e) => sum + e.qty, 0);
  const cartTotal = cartEntries.reduce((sum, e) => sum + effectivePrice(e.item) * e.qty, 0);

  const whatsAppRaised = page === "restaurant" && cartCount > 0;

  function sendOrderOnWhatsApp() {
    const lines = cartEntries.map((e) => `- ${e.item.name} x${e.qty} (${formatMoney(effectivePrice(e.item) * e.qty)})`);
    const message = [`Order request for ${hotel.name}:`, ...lines, `Total: ${formatMoney(cartTotal)}`].join("\n");
    window.open(waLink(hotel.phoneNumber, message), "_blank", "noopener,noreferrer");
  }
  function sendTableBookingOnWhatsApp(details: { name: string; phone: string; notes: string }) {
    const message = [
      `Table reservation request for ${hotel.name}:`,
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Date: ${tbDate || "flexible"}`,
      `Time: ${tbTime}`,
      `Guests: ${tbGuests}`,
      `Seating: ${tbSeating}`,
      details.notes ? `Notes: ${details.notes}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(hotel.phoneNumber, message), "_blank", "noopener,noreferrer");
  }
  function requestStayBooking(stay: RoomType | Cabin) {
    const message = [
      `Booking request for ${hotel.name}:`,
      `- ${stay.name}`,
      `Check-in: ${checkIn || "flexible"}`,
      `Check-out: ${checkOut || "flexible"}`,
      `Guests: ${guests}`,
    ].join("\n");
    window.open(waLink(hotel.phoneNumber, message), "_blank", "noopener,noreferrer");
  }

  const NAV: { id: Page; label: string }[] = [
    { id: "home", label: "Home" },
    ...(showRooms ? [{ id: "rooms" as const, label: "Rooms" }] : []),
    ...(showCabins ? [{ id: "cabins" as const, label: "Cabins" }] : []),
    ...(showGallery ? [{ id: "gallery" as const, label: "Gallery" }] : []),
    ...(showRestaurant ? [{ id: "restaurant" as const, label: "Restaurant" }] : []),
    ...(showRestaurant ? [{ id: "table-booking" as const, label: "Table booking" }] : []),
    { id: "contact", label: "Contact" },
  ];

  function goTo(target: Page) {
    if (basePath) router.push(pageHref(basePath, target));
    else setInternalPage(target);
    setMobileNavOpen(false);
  }

  const homeSections: Record<HomeSectionId, (index: number) => React.ReactNode> = {
    about: (i) => (
      <section key="about" className="border-t border-[var(--site-border)] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <Rail index={String(i + 2).padStart(2, "0")} label="About us">
          <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[0.9fr_1.1fr] sm:gap-14">
            <EditableImage
              src={content.aboutImageUrl || galleryImages[0]}
              editable={editable}
              onChange={(url) => onContentChange?.({ aboutImageUrl: url })}
              folder="/hotel-website"
              className="aspect-4/5 overflow-hidden rounded-sm"
            />
            <div className="flex flex-col gap-5">
              <EditableText
                value={content.aboutHeading}
                onChange={editable ? set("aboutHeading") : undefined}
                editable={editable}
                as="h2"
                className="max-w-lg text-balance font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl"
                styleId="aboutHeading"
                style={content.textStyles?.aboutHeading}
                onStyleChange={editable ? setStyle : undefined}
              />
              <EditableText
                value={content.aboutBody}
                onChange={editable ? set("aboutBody") : undefined}
                editable={editable}
                as="p"
                multiline
                className="max-w-lg text-[var(--site-muted)]"
                styleId="aboutBody"
                style={content.textStyles?.aboutBody}
                onStyleChange={editable ? setStyle : undefined}
              />
              <div className="mt-4 grid grid-cols-3 gap-6 border-t border-[var(--site-border)] pt-6">
                {[
                  { value: String(roomTypes.length), label: "Rooms" },
                  { value: String(cabins.length), label: "Cabins" },
                  { value: "24/7", label: "WhatsApp support" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--site-primary)]">{s.value}</span>
                    <span className="text-xs tracking-wide text-[var(--site-muted)] uppercase">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Rail>
      </section>
    ),
    gallery: (i) =>
      showGallery ? (
        <section key="gallery" className="border-t border-[var(--site-border)] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <Rail index={String(i + 2).padStart(2, "0")} label="Gallery">
            <GalleryBento images={galleryImages} radius="rounded-sm" />
          </Rail>
        </section>
      ) : null,
    topPicks: (i) =>
      topPickRooms.length > 0 ? (
        <section key="topPicks" className="border-t border-[var(--site-border)] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <Rail index={String(i + 2).padStart(2, "0")} label="Top picks">
            <div className="flex flex-col gap-10">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">Guest favorites</h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {topPickRooms.slice(0, 4).map((room) => (
                  <Link
                    key={room.id}
                    href={basePath ? pageHref(basePath, "room-detail", room.id) : "#"}
                    onClick={(e) => {
                      if (!basePath) {
                        e.preventDefault();
                        goTo("rooms");
                      }
                    }}
                    className="group flex flex-col gap-3"
                  >
                    <div className="aspect-square overflow-hidden rounded-sm">
                      {room.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                        <img src={room.images[0]} alt={room.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="line-clamp-1 font-[family-name:var(--font-display)] font-semibold group-hover:text-[var(--site-primary)]">{room.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--site-muted)]">
                        <UsersIcon className="size-3.5" strokeWidth={1.75} />
                        Up to {room.capacity} guests
                      </span>
                      <span className="mt-0.5 text-sm font-semibold text-[var(--site-primary)]">{formatMoney(room.basePrice)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Rail>
        </section>
      ) : null,
    rooms: (i) =>
      showRooms ? (
        <section key="rooms" className="border-t border-[var(--site-border)] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <Rail index={String(i + 2).padStart(2, "0")} label="Rooms">
            <div className="flex flex-col gap-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <EditableText
                  value={content.roomsHeading}
                  onChange={editable ? set("roomsHeading") : undefined}
                  editable={editable}
                  as="h2"
                  className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl"
                  styleId="roomsHeading"
                  style={content.textStyles?.roomsHeading}
                  onStyleChange={editable ? setStyle : undefined}
                />
                {roomTypes.length > 0 && (
                  <button type="button" onClick={() => goTo("rooms")} className="group flex items-center gap-1.5 text-sm font-medium">
                    View all rooms
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
              {roomTypes.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {roomTypes.slice(0, 3).map((room) => (
                    <StayCard key={room.id} stay={room} kind="rooms" basePath={basePath} formatMoney={formatMoney} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[var(--site-border)] p-10 text-center text-sm text-[var(--site-muted)]">
                  Room types will appear here once they&apos;re added.
                </div>
              )}
            </div>
          </Rail>
        </section>
      ) : null,
    cabins: (i) =>
      showCabins ? (
        <section key="cabins" className="border-t border-[var(--site-border)] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <Rail index={String(i + 2).padStart(2, "0")} label="Cabins">
            <div className="flex flex-col gap-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <EditableText
                  value={content.cabinsHeading}
                  onChange={editable ? set("cabinsHeading") : undefined}
                  editable={editable}
                  as="h2"
                  className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl"
                  styleId="cabinsHeading"
                  style={content.textStyles?.cabinsHeading}
                  onStyleChange={editable ? setStyle : undefined}
                />
                <button type="button" onClick={() => goTo("cabins")} className="group flex items-center gap-1.5 text-sm font-medium">
                  View all cabins
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {cabins.slice(0, 3).map((cabin) => (
                  <StayCard key={cabin.id} stay={cabin} kind="cabins" basePath={basePath} formatMoney={formatMoney} />
                ))}
              </div>
            </div>
          </Rail>
        </section>
      ) : null,
    testimonials: (i) =>
      showTestimonials ? (
        <section key="testimonials" className="border-t border-[var(--site-border)] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <Rail index={String(i + 2).padStart(2, "0")} label="What guests say">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex flex-col gap-4">
                  <div className="flex gap-0.5 text-[var(--site-primary)]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <StarIcon key={idx} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-[15px] text-[var(--site-fg)]/85">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-auto flex flex-col text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-xs text-[var(--site-muted)]">{t.stay}</span>
                  </div>
                </div>
              ))}
            </div>
          </Rail>
        </section>
      ) : null,
  };

  return (
    <div className="flex min-h-full flex-col">
      <nav className="sticky top-0 z-30 border-b border-[var(--site-border)] bg-[var(--site-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
          <div className="flex shrink-0 items-center gap-2.5">
            {(editable || logoDisplay !== "text") && (
              <EditableImage
                src={content.logoUrl || hotel.logoUrl}
                editable={editable}
                onChange={(url) => onContentChange?.({ logoUrl: url })}
                folder="/hotel-website"
                className="size-8 shrink-0 overflow-hidden rounded-sm"
                fallback={<span className="size-8" />}
              />
            )}
            {(editable || logoDisplay !== "logo") && (
              <button
                type="button"
                onClick={() => goTo("home")}
                className="cursor-pointer font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight"
              >
                {hotel.name}
              </button>
            )}
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(item.id)}
                className={
                  page === item.id
                    ? "rounded-sm bg-[var(--site-primary)]/10 px-3.5 py-2 text-sm font-medium text-[var(--site-primary)]"
                    : "cursor-pointer rounded-sm px-3.5 py-2 text-sm text-[var(--site-muted)] hover:text-[var(--site-fg)]"
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="hidden rounded-sm bg-[var(--site-primary)] px-4 text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90 sm:inline-flex"
              onClick={() => goTo("rooms")}
            >
              <EditableText value={content.ctaPrimaryLabel} onChange={editable ? set("ctaPrimaryLabel") : undefined} editable={editable} />
            </Button>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="hover:bg-[var(--site-primary)]/10 md:hidden" aria-label="Open menu"><MenuIcon strokeWidth={1.75} /></Button>} />
              <SheetContent side="right" className="w-72 bg-[var(--site-bg)] p-0 text-[var(--site-fg)]">
                <SheetTitle className="sr-only">Site navigation</SheetTitle>
                <div className="flex flex-col gap-1 p-5 pt-14">
                  {NAV.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(item.id)}
                      className={
                        page === item.id
                          ? "rounded-sm bg-[var(--site-primary)]/10 px-4 py-3 text-[15px] font-medium text-[var(--site-primary)]"
                          : "cursor-pointer rounded-sm px-4 py-3 text-[15px] font-medium text-[var(--site-muted)] hover:text-[var(--site-fg)]"
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {page === "home" && (
        <div className="flex flex-col">
          <section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 sm:pb-28 lg:px-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
              <div className="flex flex-col gap-6">
                <span className="flex items-center gap-2.5 text-xs font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
                  <span className="text-[var(--site-primary)]">01</span>
                  <span className="h-px w-6 bg-[var(--site-border)]" />
                  <EditableText value={content.heroEyebrow} onChange={editable ? set("heroEyebrow") : undefined} editable={editable} />
                </span>
                <EditableText
                  value={content.heroHeading}
                  onChange={editable ? set("heroHeading") : undefined}
                  editable={editable}
                  as="h1"
                  className="max-w-xl text-balance font-[family-name:var(--font-display)] text-4xl leading-[1.12] font-semibold sm:text-5xl lg:text-6xl"
                  styleId="heroHeading"
                  style={content.textStyles?.heroHeading}
                  onStyleChange={editable ? setStyle : undefined}
                />
                <EditableText
                  value={content.heroSubheading}
                  onChange={editable ? set("heroSubheading") : undefined}
                  editable={editable}
                  as="p"
                  multiline
                  className="max-w-md text-[var(--site-muted)]"
                  styleId="heroSubheading"
                  style={content.textStyles?.heroSubheading}
                  onStyleChange={editable ? setStyle : undefined}
                />
                <div className="mt-2 flex flex-wrap items-center gap-6">
                  <Button size="lg" className="rounded-sm bg-[var(--site-primary)] px-6 text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90" onClick={() => goTo("contact")}>
                    <EditableText value={content.ctaPrimaryLabel} onChange={editable ? set("ctaPrimaryLabel") : undefined} editable={editable} />
                  </Button>
                  {showCabins && (
                    <button type="button" onClick={() => goTo("cabins")} className="group flex items-center gap-1.5 text-sm font-medium">
                      <EditableText value={content.ctaSecondaryLabel} onChange={editable ? set("ctaSecondaryLabel") : undefined} editable={editable} />
                      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              </div>
              <EditableImage
                src={content.heroImageUrl || hotel.logoUrl}
                editable={editable}
                onChange={(url) => onContentChange?.({ heroImageUrl: url })}
                folder="/hotel-website"
                className="aspect-4/5 w-full overflow-hidden rounded-sm sm:aspect-3/4 lg:aspect-4/5"
              />
            </div>

            <div className="mt-12 border-t border-[var(--site-border)] pt-10 sm:mt-16">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end lg:gap-6">
                <label className="flex flex-col gap-2 border-b border-[var(--site-border)] pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-[var(--site-muted)] uppercase">
                    <CalendarIcon className="size-3.5" strokeWidth={1.75} />
                    Check-in
                  </span>
                  <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="h-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0" />
                </label>
                <label className="flex flex-col gap-2 border-b border-[var(--site-border)] pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-[var(--site-muted)] uppercase">
                    <CalendarIcon className="size-3.5" strokeWidth={1.75} />
                    Check-out
                  </span>
                  <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="h-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0" />
                </label>
                <div className="flex flex-col gap-2 border-b border-[var(--site-border)] pb-2">
                  <span className="text-xs font-medium tracking-[0.1em] text-[var(--site-muted)] uppercase">Guests</span>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Decrease guests" className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[var(--site-primary)]/10">
                      <MinusIcon className="size-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-medium tabular-nums">{guests}</span>
                    <button type="button" onClick={() => setGuests((g) => Math.min(12, g + 1))} aria-label="Increase guests" className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[var(--site-primary)]/10">
                      <PlusIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
                <Button className="h-11 gap-2 rounded-sm bg-[var(--site-primary)] px-6 text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90 sm:col-span-2 lg:col-span-1" onClick={() => goTo(showRooms ? "rooms" : "contact")}>
                  <SearchIcon className="size-4" />
                  Search availability
                </Button>
              </div>
            </div>
          </section>

          <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-20 sm:grid-cols-3 sm:px-6 sm:py-28 lg:px-10">
            {[
              { Icon: HandCoinsIcon, title: "Direct rates", body: "No third-party booking fees — you deal with us directly." },
              { Icon: MessageCircleIcon, title: "Personal service", body: "Reach us on WhatsApp or by phone and we'll sort out the details." },
              { Icon: CalendarCheckIcon, title: "Flexible dates", body: "Check availability and we'll confirm what works for your stay." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-3">
                <Icon className="size-5 text-[var(--site-primary)]" strokeWidth={1.5} />
                <span className="font-[family-name:var(--font-display)] text-base font-semibold">{title}</span>
                <span className="text-sm text-[var(--site-muted)]">{body}</span>
              </div>
            ))}
          </section>

          {homeSectionOrder(content).map((id, i) => homeSections[id](i))}

          {isSectionEnabled(content, "contact") && (
            <section className="flex flex-col items-center gap-6 border-t border-[var(--site-border)] bg-[var(--site-fg)] px-4 py-20 text-center text-[var(--site-bg)] sm:px-6 sm:py-28 lg:px-10">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">Your stay starts here.</h2>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <Button size="lg" className="rounded-sm bg-[var(--site-bg)] px-6 text-[var(--site-fg)] hover:opacity-90" onClick={() => goTo("contact")}>
                  Check availability
                </Button>
                <button type="button" onClick={() => goTo("contact")} className="text-sm font-medium opacity-70 hover:opacity-100">
                  Contact us
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {page === "rooms" && showRooms && (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">{content.roomsHeading}</h1>
            <p className="text-[var(--site-muted)]">{content.roomsSubheading}</p>
          </div>
          {roomTypes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roomTypes.map((room) => (
                <StayCard key={room.id} stay={room} kind="rooms" basePath={basePath} formatMoney={formatMoney} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[var(--site-border)] p-10 text-center text-sm text-[var(--site-muted)]">
              Room types will appear here once they&apos;re added.
            </div>
          )}
        </div>
      )}

      {page === "cabins" && showCabins && (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">{content.cabinsHeading}</h1>
            <p className="text-[var(--site-muted)]">{content.cabinsSubheading}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cabins.map((cabin) => (
              <StayCard key={cabin.id} stay={cabin} kind="cabins" basePath={basePath} formatMoney={formatMoney} />
            ))}
          </div>
        </div>
      )}

      {(page === "room-detail" || page === "cabin-detail") &&
        (() => {
          const kind = page === "room-detail" ? "rooms" : "cabins";
          const list: (RoomType | Cabin)[] = kind === "rooms" ? roomTypes : cabins;
          const stay = list.find((s) => s.id === detailId);
          if (!stay) return <div className="px-4 py-14 sm:px-6">Not found.</div>;
          const related = list.filter((s) => s.id !== stay.id).slice(0, 2);
          return (
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
              <Button variant="ghost" className="w-fit rounded-sm hover:bg-[var(--site-primary)]/10" nativeButton={!basePath} render={basePath ? <Link href={pageHref(basePath, kind)} /> : undefined}>
                <ArrowLeftIcon className="mr-1.5 size-4" />
                All {kind}
              </Button>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
                <div className="flex flex-col gap-6">
                  <div className="overflow-hidden rounded-sm bg-[var(--site-primary)]/10">
                    {stay.images[activeImage] && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                      <img src={stay.images[activeImage]} alt={stay.name} className="aspect-4/3 w-full object-cover" />
                    )}
                  </div>
                  {stay.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {stay.images.map((img, i) => (
                        <button key={img + i} type="button" onClick={() => setActiveImage(i)} className={i === activeImage ? "overflow-hidden rounded-sm opacity-100 ring-2 ring-[var(--site-primary)] ring-offset-2" : "cursor-pointer overflow-hidden rounded-sm opacity-60 hover:opacity-100"}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                          <img src={img} alt="" className="aspect-4/3 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-3 border-t border-[var(--site-border)] pt-6">
                    <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">{stay.name}</h1>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--site-muted)]">
                      <span className="flex items-center gap-1.5">
                        <UsersIcon className="size-4" strokeWidth={1.75} />
                        Sleeps {stay.capacity}
                      </span>
                      {"pricingLabel" in stay && stay.pricingLabel && <span>{stay.pricingLabel}</span>}
                    </div>
                    {stay.description && <p className="text-[var(--site-fg)]/85">{stay.description}</p>}
                    {stay.amenities.length > 0 && (
                      <>
                        <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold">Amenities</h2>
                        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {stay.amenities.map((a) => (
                            <li key={a} className="flex items-center gap-2.5 text-sm">
                              <CheckIcon className="size-4 shrink-0 text-[var(--site-primary)]" strokeWidth={2} />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
                <aside className="h-fit lg:sticky lg:top-24">
                  <div className="flex flex-col gap-3 rounded-sm border border-[var(--site-border)] bg-[var(--site-card)] p-5 sm:p-6">
                    <p className="text-sm text-[var(--site-muted)]">
                      <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--site-fg)]">{formatMoney(stay.basePrice)}</span> / night
                    </p>
                    <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Check-in</span>
                    <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                    <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Check-out</span>
                    <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                    <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Guests</span>
                    <Input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} />
                    <Button className="mt-1 rounded-sm bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90" onClick={() => requestStayBooking(stay)}>
                      Request booking
                    </Button>
                  </div>
                </aside>
              </div>
              {related.length > 0 && (
                <div className="flex flex-col gap-5 border-t border-[var(--site-border)] pt-10">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">You may also like</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {related.map((s) => (
                      <Link key={s.id} href={pageHref(basePath, kind === "rooms" ? "room-detail" : "cabin-detail", s.id)} className="group grid grid-cols-[7rem_1fr] items-center gap-4 sm:grid-cols-[9rem_1fr]">
                        <div className="overflow-hidden rounded-sm">
                          {s.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                            <img src={s.images[0]} alt={s.name} className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="aspect-4/3 w-full bg-[var(--site-primary)]/10" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold group-hover:text-[var(--site-primary)]">{s.name}</p>
                          <p className="mt-1 text-sm text-[var(--site-muted)]">{formatMoney(s.basePrice)} / night</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      {page === "gallery" && showGallery && (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">{content.galleryHeading}</h1>
          <GalleryBento images={galleryImages} radius="rounded-sm" />
        </div>
      )}

      {page === "restaurant" && showRestaurant && (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 pb-28 sm:px-6 sm:py-16 lg:px-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">{content.restaurantHeading}</h1>
            <p className="text-[var(--site-muted)]">{content.restaurantSubheading}</p>
          </div>
          <div className="flex gap-6 overflow-x-auto border-b border-[var(--site-border)] pb-3">
            {categories.map(([categoryName]) => (
              <a key={categoryName} href={`#menu-${categoryName}`} className="shrink-0 text-sm font-medium whitespace-nowrap text-[var(--site-muted)] hover:text-[var(--site-fg)]">
                {categoryName}
              </a>
            ))}
          </div>
          {topPickDishes.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold">
                <StarIcon className="size-4 fill-[var(--site-primary)] text-[var(--site-primary)]" />
                Chef&apos;s picks
              </h3>
              <div className="flex gap-6 overflow-x-auto pb-1">
                {topPickDishes.map((item) => (
                  <div key={item.id} className="flex w-52 shrink-0 flex-col gap-1 border-l-2 border-[var(--site-primary)] pl-3">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sm text-[var(--site-primary)]">{formatMoney(effectivePrice(item))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-10">
            {categories.map(([categoryName, items]) => (
              <div key={categoryName} id={`menu-${categoryName}`} className="flex scroll-mt-24 flex-col gap-5">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">{categoryName}</h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const qty = cart[item.id] ?? 0;
                    return (
                      <div key={item.id} className="flex flex-col gap-3">
                        <div className="aspect-video overflow-hidden rounded-sm bg-[var(--site-primary)]/10">
                          {item.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                            <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-2 font-semibold">
                            <span className={`size-1.5 shrink-0 rounded-full ${FOOD_TYPE_DOT[item.foodType] ?? "bg-muted-foreground"}`} />
                            <span className="line-clamp-1">{item.name}</span>
                            {item.isTopPick && <Badge className="shrink-0 rounded-sm bg-[var(--site-primary)] text-[var(--site-primary-fg)]">Top pick</Badge>}
                          </span>
                          {item.description && <p className="line-clamp-2 min-h-10 text-sm text-[var(--site-muted)]">{item.description}</p>}
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-semibold text-[var(--site-primary)]">{formatMoney(effectivePrice(item))}</span>
                            {qty === 0 ? (
                              <Button size="sm" variant="outline" className="rounded-sm hover:bg-[var(--site-primary)]/10" onClick={() => setQty(item.id, 1)}>
                                Add to order
                              </Button>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setQty(item.id, qty - 1)} className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-[var(--site-primary)]/10" aria-label="Decrease quantity">
                                  <MinusIcon className="size-3.5" />
                                </button>
                                <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                                <button type="button" onClick={() => setQty(item.id, qty + 1)} className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-[var(--site-primary)]/10" aria-label="Increase quantity">
                                  <PlusIcon className="size-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {cartCount > 0 && (
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--site-border)] bg-[var(--site-bg)] px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] sm:px-6 lg:px-10">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm">
                  <ShoppingBagIcon className="size-4 text-[var(--site-primary)]" />
                  {cartCount} item{cartCount > 1 ? "s" : ""} · {formatMoney(cartTotal)}
                </span>
                <Button size="sm" className="rounded-sm bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90" onClick={sendOrderOnWhatsApp}>
                  Send order on WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {page === "table-booking" && showRestaurant && (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="flex max-w-xl flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">Book a table</h1>
            <p className="text-[var(--site-muted)]">Send us your details and we&apos;ll confirm your table over WhatsApp.</p>
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const data2 = new FormData(e.currentTarget);
                sendTableBookingOnWhatsApp({ name: String(data2.get("name") ?? ""), phone: String(data2.get("phone") ?? ""), notes: String(data2.get("notes") ?? "") });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Full name</span>
                  <Input name="name" required placeholder="Your name" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Phone</span>
                  <Input name="phone" required placeholder="Your phone" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Date</span>
                  <Input type="date" value={tbDate} onChange={(e) => setTbDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Time</span>
                  <Select value={tbTime} onValueChange={(v) => setTbTime(v ?? tbTime)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Guests</span>
                  <Select value={tbGuests} onValueChange={(v) => setTbGuests(v ?? tbGuests)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "guest" : "guests"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Seating</span>
                  <Select value={tbSeating} onValueChange={(v) => setTbSeating(v ?? tbSeating)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                      <SelectItem value="No preference">No preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-[var(--site-muted)] uppercase">Notes (allergies, occasion)</span>
                  <Textarea name="notes" rows={4} />
                </div>
              </div>
              <Button type="submit" className="mt-2 w-fit rounded-sm bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90">
                Request reservation
              </Button>
            </form>
            <aside className="flex h-fit flex-col gap-4 border-t border-[var(--site-border)] pt-8 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Good to know</h2>
                <ul className="mt-3 flex flex-col gap-2 text-[var(--site-muted)]">
                  <li>We&apos;ll confirm your table over WhatsApp shortly after you send it</li>
                  <li>Large groups — please call us directly</li>
                  <li>Let us know about allergies or dietary needs in the notes</li>
                </ul>
              </div>
              <div className="border-t border-[var(--site-border)] pt-4 text-[var(--site-muted)]">
                <p className="font-semibold text-[var(--site-fg)]">Call the restaurant</p>
                <p className="mt-1">{hotel.phoneNumber}</p>
              </div>
            </aside>
          </div>
        </div>
      )}

      {page === "contact" && (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
            <EditableText
              value={content.contactHeading}
              onChange={editable ? set("contactHeading") : undefined}
              editable={editable}
              as="h1"
              className="font-[family-name:var(--font-display)] text-4xl font-semibold"
              styleId="contactHeading"
              style={content.textStyles?.contactHeading}
              onStyleChange={editable ? setStyle : undefined}
            />
            <EditableText
              value={content.contactBody}
              onChange={editable ? set("contactBody") : undefined}
              editable={editable}
              as="p"
              multiline
              className="text-[var(--site-muted)]"
              styleId="contactBody"
              style={content.textStyles?.contactBody}
              onStyleChange={editable ? setStyle : undefined}
            />
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              {coords ? (
                <iframe title="Location map" src={googleMapEmbedSrc(coords.lat, coords.lng)} className="aspect-video w-full rounded-sm" loading="lazy" />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-sm bg-[var(--site-card)] text-[var(--site-muted)]">
                  <MapPinIcon className="size-8" />
                </div>
              )}
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--site-primary)] hover:underline">
                  <MapPinIcon className="size-4" />
                  Get directions
                </a>
              )}
            </div>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                toast.info("This form isn't connected yet — reach out directly using the details below.");
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Name" required />
                <Input placeholder="Email" type="email" required />
              </div>
              <Input placeholder="Phone" />
              <Input placeholder="Subject" />
              <Textarea placeholder="Message" rows={4} />
              <Button type="submit" className="w-fit rounded-sm bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90">
                Send message
              </Button>
            </form>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 border-t border-[var(--site-border)] pt-8 text-sm text-[var(--site-muted)]">
            {hotel.address && (
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="size-4" strokeWidth={1.75} />
                {hotel.address}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <PhoneIcon className="size-4" strokeWidth={1.75} />
              {hotel.phoneNumber}
            </span>
            {hotel.email && (
              <span className="flex items-center gap-1.5">
                <MailIcon className="size-4" strokeWidth={1.75} />
                {hotel.email}
              </span>
            )}
          </div>
        </div>
      )}

      <footer className="mt-auto border-t border-[var(--site-border)] bg-[var(--site-fg)] px-4 py-16 text-[var(--site-bg)]/60 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--site-bg)]">{hotel.name}</span>
              {hotel.description && <p className="max-w-xs text-sm leading-relaxed">{hotel.description}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium tracking-[0.12em] uppercase opacity-60">Explore</span>
              <button type="button" onClick={() => goTo("home")} className="w-fit cursor-pointer text-left text-sm hover:text-[var(--site-bg)]">Home</button>
              {showRooms && <button type="button" onClick={() => goTo("rooms")} className="w-fit cursor-pointer text-left text-sm hover:text-[var(--site-bg)]">Rooms</button>}
              {showCabins && <button type="button" onClick={() => goTo("cabins")} className="w-fit cursor-pointer text-left text-sm hover:text-[var(--site-bg)]">Cabins</button>}
              {showGallery && <button type="button" onClick={() => goTo("gallery")} className="w-fit cursor-pointer text-left text-sm hover:text-[var(--site-bg)]">Gallery</button>}
            </div>
            {showRestaurant && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium tracking-[0.12em] uppercase opacity-60">Dining</span>
                <button type="button" onClick={() => goTo("restaurant")} className="w-fit cursor-pointer text-left text-sm hover:text-[var(--site-bg)]">Menu</button>
                <button type="button" onClick={() => goTo("table-booking")} className="w-fit cursor-pointer text-left text-sm hover:text-[var(--site-bg)]">Reserve a table</button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium tracking-[0.12em] uppercase opacity-60">Get in touch</span>
              {hotel.address && (
                <span className="flex items-start gap-1.5 text-sm">
                  <MapPinIcon className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
                  {hotel.address}
                </span>
              )}
              <a href={`tel:${hotel.phoneNumber}`} className="flex items-center gap-1.5 text-sm hover:text-[var(--site-bg)]">
                <PhoneIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
                {hotel.phoneNumber}
              </a>
              {hotel.email && (
                <a href={`mailto:${hotel.email}`} className="flex items-center gap-1.5 text-sm hover:text-[var(--site-bg)]">
                  <MailIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  {hotel.email}
                </a>
              )}
              <a href={waLink(hotel.phoneNumber)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:text-[var(--site-bg)]">
                <WhatsAppIcon className="size-3.5 shrink-0" />
                WhatsApp
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--site-bg)]/10 pt-6 text-xs sm:flex-row">
            <span>© {new Date().getFullYear()} {hotel.name}. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <a
        href={waLink(hotel.phoneNumber)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={`fixed right-4 z-40 flex size-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-[bottom,transform] duration-200 hover:scale-105 sm:right-6 ${
          whatsAppRaised ? "bottom-24 sm:bottom-28" : "bottom-4 sm:bottom-6"
        }`}
      >
        <WhatsAppIcon className="size-6" />
      </a>
    </div>
  );
}
