"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  CalendarCheckIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DumbbellIcon,
  HandCoinsIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  MessageCircleIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  ShoppingBagIcon,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Cabin } from "@/features/tenant/cabin/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";

import { EditableImage } from "../components/editable-image";
import { EditableText } from "../components/editable-text";
import { themeVars } from "../themes/theme-presets";
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.986.55 3.834 1.503 5.415L2 22l4.68-1.472A9.96 9.96 0 0 0 12.004 22c5.518 0 10.004-4.486 10.004-9.996S17.522 2 12.004 2Zm0 18.15a8.1 8.1 0 0 1-4.318-1.246l-.31-.188-3.02.951.978-2.94-.202-.32a8.14 8.14 0 0 1-1.28-4.402c0-4.503 3.667-8.166 8.152-8.166 4.484 0 8.15 3.663 8.15 8.166 0 4.503-3.666 8.145-8.15 8.145Z" />
    </svg>
  );
}

function waLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function parseLatLng(mapUrl?: string): { lat: number; lng: number } | null {
  if (!mapUrl) return null;
  const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/];
  for (const pattern of patterns) {
    const match = mapUrl.match(pattern);
    if (match) return { lat: Number(match[1]), lng: Number(match[2]) };
  }
  return null;
}

function googleMapEmbedSrc(lat: number, lng: number) {
  // Keyless embed — no Maps Embed API key required.
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}

export type Page =
  | "home"
  | "rooms"
  | "cabins"
  | "gallery"
  | "restaurant"
  | "table-booking"
  | "contact";

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
  themeId,
  editable = false,
  onContentChange,
  page: controlledPage,
  basePath,
}: {
  data: SiteData;
  themeId: string;
  editable?: boolean;
  onContentChange?: (patch: Partial<SiteContent>) => void;
  /** When provided (with `basePath`), navigation pushes real URLs instead of local state — used by the public site. */
  page?: Page;
  basePath?: string;
}) {
  const { hotel, roomTypes, cabins, menuItems, galleryImages, mapUrl, content, formatMoney } = data;
  const coords = React.useMemo(() => parseLatLng(mapUrl), [mapUrl]);
  const router = useRouter();
  const [internalPage, setInternalPage] = React.useState<Page>("home");
  const page = controlledPage ?? internalPage;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [roomCapacityFilter, setRoomCapacityFilter] = React.useState<number | null>(null);
  const [tbDate, setTbDate] = React.useState("");
  const [tbTime, setTbTime] = React.useState("19:30");
  const [tbGuests, setTbGuests] = React.useState("2");
  const [tbSeating, setTbSeating] = React.useState("No preference");

  // Sheet/Dialog/Popover content portals to document.body, escaping the
  // SiteThemeProvider's CSS variable scope — re-declare the vars on those roots.
  const siteVars = themeVars(themeId, "light") as React.CSSProperties;

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

  function sendOrderOnWhatsApp() {
    const lines = cartEntries.map((e) => `- ${e.item.name} x${e.qty} (${formatMoney(effectivePrice(e.item) * e.qty)})`);
    const message = [`Order request for ${hotel.name}:`, ...lines, `Total: ${formatMoney(cartTotal)}`].join("\n");
    window.open(waLink(hotel.phoneNumber, message), "_blank", "noopener,noreferrer");
  }

  const NAV: { id: Page; label: string }[] = [
    { id: "home", label: "Home" },
    ...(showRooms ? [{ id: "rooms" as const, label: "Rooms" }] : []),
    ...(showCabins ? [{ id: "cabins" as const, label: "Cabins" }] : []),
    ...(showGallery ? [{ id: "gallery" as const, label: "Gallery" }] : []),
    ...(showRestaurant ? [{ id: "restaurant" as const, label: "Restaurant" }] : []),
    ...(showRestaurant ? [{ id: "table-booking" as const, label: "Table Booking" }] : []),
    { id: "contact", label: "Contact" },
  ];

  function sendTableBookingOnWhatsApp(details: {
    name: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    seating: string;
    notes: string;
  }) {
    const message = [
      `Table reservation request for ${hotel.name}:`,
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Date: ${details.date || "flexible"}`,
      `Time: ${details.time}`,
      `Guests: ${details.guests}`,
      `Seating: ${details.seating}`,
      details.notes ? `Notes: ${details.notes}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(hotel.phoneNumber, message), "_blank", "noopener,noreferrer");
  }

  function goTo(target: Page) {
    if (controlledPage !== undefined && basePath) {
      router.push(target === "home" ? basePath : `${basePath}/${target === "restaurant" ? "menu" : target}`);
    } else {
      setInternalPage(target);
    }
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
            <div className="flex items-center gap-2">
              {basePath && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
                  render={<Link href={`${basePath}/rooms/${room.id}`} />}
                >
                  Details
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                onClick={() => goTo("contact")}
              >
                Book now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function RoomListItem({ room }: { room: RoomType }) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-4 sm:flex-row">
        <div className="aspect-4/3 shrink-0 overflow-hidden rounded-xl sm:w-64">
          <ImageCarousel images={room.images} alt={room.name} />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
                {room.name}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-[var(--site-muted)]">
                <UsersIcon className="size-3.5" />
                Up to {room.capacity} guests
                {room.pricingLabel && <span>· {room.pricingLabel}</span>}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--site-primary)]">
                {formatMoney(room.basePrice)}
                <span className="ml-1 text-xs font-normal text-[var(--site-muted)]">/ night</span>
              </span>
              <div className="flex items-center gap-2">
                {basePath && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
                    render={<Link href={`${basePath}/rooms/${room.id}`} />}
                  >
                    Details
                  </Button>
                )}
                <Button
                  size="sm"
                  className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                  onClick={() => goTo("contact")}
                >
                  Reserve
                </Button>
              </div>
            </div>
          </div>
          {room.description && (
            <p className="text-sm text-[var(--site-muted)]">{room.description}</p>
          )}
          {room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--site-muted)]">
              {room.amenities.slice(0, 6).map((a) => (
                <span key={a} className="flex items-center gap-1.5">
                  <CheckIcon className="size-3.5 text-[var(--site-primary)]" />
                  {a}
                </span>
              ))}
            </div>
          )}
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
            <div className="flex items-center gap-2">
              {basePath && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
                  render={<Link href={`${basePath}/cabins/${cabin.id}`} />}
                >
                  Details
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                onClick={() => goTo("contact")}
              >
                Reserve
              </Button>
            </div>
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

        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
                  aria-label="Notifications"
                />
              }
            >
              <BellIcon />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="bg-[var(--site-card)] text-[var(--site-fg)] ring-[var(--site-border)]"
              style={siteVars}
            >
              <span className="text-sm font-medium">Notifications</span>
              <p className="mt-1 text-sm text-[var(--site-muted)]">
                You&apos;ll see booking and order updates here once you reserve or place an order.
              </p>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            className="hidden rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90 sm:inline-flex"
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
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)] md:hidden"
                  aria-label="Menu"
                >
                  <MenuIcon />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="bg-[var(--site-bg)] p-0 text-[var(--site-fg)]"
              style={siteVars}
            >
              <SheetTitle className="sr-only">Site navigation</SheetTitle>
              <div className="flex flex-col gap-1 p-6">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(item.id)}
                    className={
                      page === item.id
                        ? "rounded-lg bg-[var(--site-primary)]/10 px-3 py-2.5 text-left font-medium text-[var(--site-primary)]"
                        : "cursor-pointer rounded-lg px-3 py-2.5 text-left text-[var(--site-muted)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
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
                className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                onClick={() => goTo("contact")}
              >
                Search availability
              </Button>
            </div>
          </section>

          {/* Why book direct */}
          <section className="grid grid-cols-1 gap-8 px-6 py-14 text-center sm:grid-cols-3 sm:px-10">
            {[
              { Icon: HandCoinsIcon, title: "Direct rates", body: "No third-party booking fees — you deal with us directly." },
              { Icon: MessageCircleIcon, title: "Personal service", body: "Reach us on WhatsApp or by phone and we'll sort out the details." },
              { Icon: CalendarCheckIcon, title: "Flexible dates", body: "Check availability and we'll confirm what works for your stay." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-[var(--site-primary)]/10 text-[var(--site-primary)]">
                  <Icon className="size-5" />
                </span>
                <span className="font-medium">{title}</span>
                <span className="max-w-56 text-sm text-[var(--site-muted)]">{body}</span>
              </div>
            ))}
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
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
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

          {/* Top Picks */}
          {showRestaurant && topPicks.length > 0 && (
            <section className="flex flex-col gap-8 border-t border-[var(--site-border)] bg-[var(--site-card)] px-6 py-16 sm:px-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-[var(--site-primary)] uppercase">
                    <StarIcon className="size-3.5 fill-current" />
                    Top picks
                  </span>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                    Guest favorites from the kitchen
                  </h2>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
                  onClick={() => goTo("restaurant")}
                >
                  Order now
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {topPicks.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo("restaurant")}
                    className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-bg)] text-left transition-transform hover:-translate-y-0.5"
                  >
                    <div className="aspect-square">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                        <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-[var(--site-primary)]/10" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-[var(--site-primary)]">
                        {formatMoney(item.price)}
                      </span>
                    </div>
                  </button>
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
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
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
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
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
                    className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                    onClick={() => goTo("restaurant")}
                  >
                    View menu
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
                    onClick={() => goTo("table-booking")}
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
                  className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                  onClick={() => goTo("contact")}
                >
                  Check availability
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-[var(--site-border)] bg-transparent text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10 hover:text-[var(--site-fg)]"
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

          {/* Photo gallery mosaic */}
          {(() => {
            const roomImages = roomTypes.flatMap((r) => r.images);
            if (roomImages.length === 0) return null;
            const shown = roomImages.slice(0, 5);
            const remaining = roomImages.length - shown.length;
            return (
              <div className="grid h-80 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-96">
                <div className="relative col-span-2 row-span-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                  <img src={shown[0]} alt="" className="size-full object-cover" />
                </div>
                {shown.slice(1).map((url, i) => (
                  <div key={url + i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                    <img src={url} alt="" className="size-full object-cover" />
                    {i === shown.length - 2 && remaining > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                        +{remaining}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              {/* Amenities */}
              {amenityPool.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-5">
                  {amenityPool.map((a) => {
                    const Icon = amenityIcon(a);
                    return (
                      <span key={a} className="flex items-center gap-2 text-sm">
                        <Icon className="size-4 text-[var(--site-primary)]" />
                        {a}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Capacity filter pills */}
              {roomTypes.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setRoomCapacityFilter(null)}
                    className={
                      roomCapacityFilter === null
                        ? "rounded-full bg-[var(--site-primary)] px-4 py-1.5 text-sm text-[var(--site-primary-fg)]"
                        : "cursor-pointer rounded-full border border-[var(--site-border)] px-4 py-1.5 text-sm hover:bg-[var(--site-primary)]/10"
                    }
                  >
                    All rooms
                  </button>
                  {[...new Set(roomTypes.map((r) => r.capacity))]
                    .sort((a, b) => a - b)
                    .map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setRoomCapacityFilter(cap)}
                        className={
                          roomCapacityFilter === cap
                            ? "rounded-full bg-[var(--site-primary)] px-4 py-1.5 text-sm text-[var(--site-primary-fg)]"
                            : "cursor-pointer rounded-full border border-[var(--site-border)] px-4 py-1.5 text-sm hover:bg-[var(--site-primary)]/10"
                        }
                      >
                        {cap}+ guests
                      </button>
                    ))}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {roomTypes
                  .filter((r) => roomCapacityFilter === null || r.capacity >= roomCapacityFilter)
                  .map((room) => (
                    <RoomListItem key={room.id} room={room} />
                  ))}
              </div>
            </div>

            {/* Sticky booking sidebar */}
            <aside className="h-fit rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-5 lg:sticky lg:top-24">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-[var(--site-muted)]">Check-in</span>
                <Input type="date" className="bg-transparent" />
                <span className="text-xs font-medium text-[var(--site-muted)]">Check-out</span>
                <Input type="date" className="bg-transparent" />
                <span className="text-xs font-medium text-[var(--site-muted)]">Guests</span>
                <Input type="number" min={1} defaultValue={2} className="bg-transparent" />
                {roomTypes.length > 0 && (
                  <div className="mt-1 flex items-baseline justify-between border-t border-[var(--site-border)] pt-3">
                    <span className="text-sm text-[var(--site-muted)]">Price range</span>
                    <span className="font-medium">
                      {formatMoney(Math.min(...roomTypes.map((r) => r.basePrice)))} –{" "}
                      {formatMoney(Math.max(...roomTypes.map((r) => r.basePrice)))}
                    </span>
                  </div>
                )}
                <Button
                  className="mt-1 rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                  onClick={() => goTo("contact")}
                >
                  Check availability
                </Button>
              </div>
            </aside>
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

          {/* Asymmetric grid — 2 large above 3 smaller, in groups of 5 */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: Math.ceil(gallery.length / 5) }).map((_, groupIndex) => {
              const start = groupIndex * 5;
              const group = gallery.slice(start, start + 5);
              return (
                <div key={groupIndex} className="flex flex-col gap-3">
                  {group.slice(0, 2).length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {group.slice(0, 2).map((img, i) => (
                        <button
                          key={img.url + i}
                          type="button"
                          onClick={() => setLightboxIndex(start + i)}
                          className="aspect-video cursor-pointer overflow-hidden rounded-2xl"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                          <img src={img.url} alt={img.label} className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  {group.slice(2, 5).length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {group.slice(2, 5).map((img, i) => (
                        <button
                          key={img.url + i}
                          type="button"
                          onClick={() => setLightboxIndex(start + 2 + i)}
                          className="aspect-square cursor-pointer overflow-hidden rounded-2xl"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                          <img src={img.url} alt={img.label} className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {page === "restaurant" && showRestaurant && (
        <div className="flex flex-col gap-10 px-6 py-14 pb-28 sm:px-10">
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
              className="mt-2 w-fit rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
              onClick={() => goTo("table-booking")}
            >
              Reserve a table
            </Button>
          </div>

          {/* Category nav — horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(([categoryName]) => (
              <a
                key={categoryName}
                href={`#menu-${categoryName}`}
                className="shrink-0 rounded-full border border-[var(--site-border)] px-3.5 py-1.5 text-sm whitespace-nowrap text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
              >
                {categoryName}
              </a>
            ))}
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
                    <span className="text-[var(--site-primary)]">{formatMoney(effectivePrice(item))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-10">
            {categories.map(([categoryName, items]) => (
              <div key={categoryName} id={`menu-${categoryName}`} className="flex scroll-mt-20 flex-col gap-4">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {categoryName}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const qty = cart[item.id] ?? 0;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)]"
                      >
                        <div className="aspect-video">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                            <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                          ) : (
                            <div className="size-full bg-[var(--site-primary)]/10" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-4">
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
                            <p className="line-clamp-2 text-sm text-[var(--site-muted)]">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <span className="font-medium text-[var(--site-primary)]">
                              {formatMoney(effectivePrice(item))}
                            </span>
                            {qty === 0 ? (
                              <Button
                                size="sm"
                                className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                                onClick={() => setQty(item.id, 1)}
                              >
                                Add to order
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 rounded-full border border-[var(--site-border)] px-1 py-1">
                                <button
                                  type="button"
                                  onClick={() => setQty(item.id, qty - 1)}
                                  className="flex size-6 cursor-pointer items-center justify-center rounded-full text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
                                  aria-label="Decrease quantity"
                                >
                                  <MinusIcon className="size-3.5" />
                                </button>
                                <span className="w-4 text-center text-sm font-medium">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => setQty(item.id, qty + 1)}
                                  className="flex size-6 cursor-pointer items-center justify-center rounded-full text-[var(--site-fg)] hover:bg-[var(--site-primary)]/10"
                                  aria-label="Increase quantity"
                                >
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

          {/* Sticky order bar */}
          {cartCount > 0 && (
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--site-border)] bg-[var(--site-bg)] px-6 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-10">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm">
                  <ShoppingBagIcon className="size-4 text-[var(--site-primary)]" />
                  {cartCount} item{cartCount > 1 ? "s" : ""} · {formatMoney(cartTotal)}
                </span>
                <Button
                  size="sm"
                  className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
                  onClick={sendOrderOnWhatsApp}
                >
                  Send order on WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {page === "table-booking" && showRestaurant && (
        <div className="flex flex-col gap-8 px-6 py-14 sm:px-10">
          <div className="flex max-w-xl flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
              Book a table
            </h1>
            <p className="text-[var(--site-muted)]">
              Send us your details and we&apos;ll confirm your table over WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            <form
              className="flex flex-col gap-4 rounded-3xl border border-[var(--site-border)] bg-[var(--site-card)] p-5 sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                sendTableBookingOnWhatsApp({
                  name: String(data.get("name") ?? ""),
                  phone: String(data.get("phone") ?? ""),
                  date: tbDate,
                  time: tbTime,
                  guests: tbGuests,
                  seating: tbSeating,
                  notes: String(data.get("notes") ?? ""),
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Full name</span>
                  <Input name="name" required placeholder="Your name" className="bg-transparent" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Phone</span>
                  <Input name="phone" required placeholder="Your phone" className="bg-transparent" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Date</span>
                  <Input
                    type="date"
                    value={tbDate}
                    onChange={(e) => setTbDate(e.target.value)}
                    className="bg-transparent"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Time</span>
                  <Select value={tbTime} onValueChange={(v) => setTbTime(v ?? tbTime)}>
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Guests</span>
                  <Select value={tbGuests} onValueChange={(v) => setTbGuests(v ?? tbGuests)}>
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Seating</span>
                  <Select value={tbSeating} onValueChange={(v) => setTbSeating(v ?? tbSeating)}>
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                      <SelectItem value="No preference">No preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-[var(--site-muted)]">
                    Notes (allergies, occasion)
                  </span>
                  <Textarea name="notes" rows={4} className="bg-transparent" />
                </div>
              </div>
              <Button
                type="submit"
                className="mt-1 w-fit rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
              >
                Request reservation
              </Button>
            </form>

            <aside className="flex h-fit flex-col gap-4 rounded-3xl border border-[var(--site-border)] bg-[var(--site-card)] p-6 text-sm">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  Good to know
                </h2>
                <ul className="mt-3 flex flex-col gap-2 text-[var(--site-muted)]">
                  <li>We&apos;ll confirm your table over WhatsApp shortly after you send it</li>
                  <li>Large groups — please call us directly</li>
                  <li>Let us know about allergies or dietary needs in the notes</li>
                </ul>
              </div>
              <div className="border-t border-[var(--site-border)] pt-4 text-[var(--site-muted)]">
                <p className="font-medium text-[var(--site-fg)]">Call the restaurant</p>
                <p className="mt-1">{hotel.phoneNumber}</p>
              </div>
            </aside>
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
            <div className="flex flex-col gap-2">
              {coords ? (
                <iframe
                  title="Location map"
                  src={googleMapEmbedSrc(coords.lat, coords.lng)}
                  className="aspect-video w-full rounded-2xl border-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-2xl bg-[var(--site-card)] text-[var(--site-muted)]">
                  <MapPinIcon className="size-8" />
                </div>
              )}
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--site-primary)] hover:underline"
                >
                  <MapPinIcon className="size-4" />
                  Get directions
                </a>
              )}
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
                className="w-fit rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90"
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
      <footer className="mt-auto bg-[#0b0e14] px-6 py-14 text-neutral-400 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                {hotel.name}
              </span>
              {hotel.description && (
                <p className="max-w-xs text-sm">{hotel.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-white">Explore</span>
              <button
                type="button"
                onClick={() => goTo("home")}
                className="w-fit cursor-pointer text-left text-sm transition-colors hover:text-white"
              >
                Home
              </button>
              {showRooms && (
                <button
                  type="button"
                  onClick={() => goTo("rooms")}
                  className="w-fit cursor-pointer text-left text-sm transition-colors hover:text-white"
                >
                  Rooms
                </button>
              )}
              {showCabins && (
                <button
                  type="button"
                  onClick={() => goTo("cabins")}
                  className="w-fit cursor-pointer text-left text-sm transition-colors hover:text-white"
                >
                  Cabins
                </button>
              )}
              {showGallery && (
                <button
                  type="button"
                  onClick={() => goTo("gallery")}
                  className="w-fit cursor-pointer text-left text-sm transition-colors hover:text-white"
                >
                  Gallery
                </button>
              )}
            </div>

            {showRestaurant && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-white">Dining</span>
                <button
                  type="button"
                  onClick={() => goTo("restaurant")}
                  className="w-fit cursor-pointer text-left text-sm transition-colors hover:text-white"
                >
                  Menu
                </button>
                <button
                  type="button"
                  onClick={() => goTo("table-booking")}
                  className="w-fit cursor-pointer text-left text-sm transition-colors hover:text-white"
                >
                  Reserve a table
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-white">Get in touch</span>
              {hotel.address && (
                <span className="flex items-start gap-1.5 text-sm">
                  <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
                  {hotel.address}
                </span>
              )}
              <a
                href={`tel:${hotel.phoneNumber}`}
                className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
              >
                <PhoneIcon className="size-3.5 shrink-0" />
                {hotel.phoneNumber}
              </a>
              {hotel.email && (
                <a
                  href={`mailto:${hotel.email}`}
                  className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                >
                  <MailIcon className="size-3.5 shrink-0" />
                  {hotel.email}
                </a>
              )}
              <a
                href={waLink(hotel.phoneNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
              >
                <WhatsAppIcon className="size-3.5 shrink-0" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
            <span>
              © {new Date().getFullYear()} {hotel.name}. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a
        href={waLink(hotel.phoneNumber)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={
          page === "restaurant" && cartCount > 0
            ? "fixed right-4 bottom-24 z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 sm:right-6 sm:bottom-28"
            : "fixed right-4 bottom-4 z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
        }
      >
        <WhatsAppIcon className="size-7" />
      </a>

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
