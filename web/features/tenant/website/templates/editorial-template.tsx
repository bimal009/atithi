"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CheckIcon, MailIcon, MapPinIcon, MenuIcon, PhoneIcon, SearchIcon, StarIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Cabin } from "@/features/tenant/cabin/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";

import { DatePicker } from "../components/date-picker";
import { EditableImage } from "../components/editable-image";
import { EditableText } from "../components/editable-text";
import { homeSectionOrder, isSectionEnabled, type HomeSectionId, type Page, type SiteContent, type TemplateComponentProps } from "../types";
import { FOOD_TYPE_DOT, GalleryBento, WhatsAppIcon, closedWeekdayIndices, googleMapEmbedSrc, pageHref, parseLatLng, timeSlotsBetween, waLink } from "./shared";

function cnImg(extra?: string) {
  return ["size-full object-cover", extra].filter(Boolean).join(" ");
}

function FooterLink({ href, external, onClick, children }: { href?: string; external?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto w-fit justify-start gap-1.5 rounded-none bg-transparent p-0 text-sm font-normal hover:bg-transparent hover:text-[var(--site-bg)]"
      nativeButton={!href}
      onClick={onClick}
      render={href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} /> : undefined}
    >
      {children}
    </Button>
  );
}

function StayCard({ stay, kind, basePath, formatMoney }: { stay: RoomType | Cabin; kind: "rooms" | "cabins"; basePath?: string; formatMoney: (amount: number) => string }) {
  const href = pageHref(basePath, kind === "rooms" ? "room-detail" : "cabin-detail", stay.id);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)]">
      <div className="aspect-4/3 overflow-hidden bg-[var(--site-primary)]/10">
        {stay.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
          <img src={stay.images[0]} alt={stay.name} className={cnImg("transition-transform duration-500 group-hover:scale-105")} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="line-clamp-1 font-[family-name:var(--font-display)] text-lg font-semibold">{stay.name}</span>
        {stay.description && <p className="line-clamp-2 min-h-10 text-sm text-[var(--site-muted)]">{stay.description}</p>}
        <span className="flex items-center gap-1.5 text-xs text-[var(--site-muted)]">
          <UsersIcon className="size-3.5" />
          Up to {stay.capacity} guests
        </span>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--site-primary)]">
            {formatMoney(stay.basePrice)}
            <span className="ml-1 text-xs font-normal text-[var(--site-muted)]">/ night</span>
          </span>
          <div className="flex items-center gap-2">
            {basePath && (
              <Button size="sm" variant="outline" className="rounded-full border-[var(--site-border)] bg-transparent hover:bg-[var(--site-primary)]/10" nativeButton={false} render={<Link href={href} />}>
                Details
              </Button>
            )}
            <Button size="sm" className="rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90" nativeButton={!basePath} render={basePath ? <Link href={href} /> : undefined}>
              Book now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorialTemplate({ data, editable = false, onContentChange, page: controlledPage, basePath, detailId }: TemplateComponentProps) {
  const { hotel, roomTypes, cabins, menuItems, galleryImages, amenities, testimonials, sections, openingTime, closingTime, openDays, mapUrl, content, formatMoney } = data;
  const tbTimeSlots = React.useMemo(() => timeSlotsBetween(openingTime, closingTime), [openingTime, closingTime]);
  const tbClosedDays = React.useMemo(() => closedWeekdayIndices(openDays), [openDays]);
  const coords = React.useMemo(() => parseLatLng(mapUrl), [mapUrl]);
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [internalPage, setInternalPage] = React.useState<Page>("home");
  const page = controlledPage ?? internalPage;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [selectedDish, setSelectedDish] = React.useState<MenuItem | null>(null);
  const [activeImage, setActiveImage] = React.useState(0);
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guests, setGuests] = React.useState(2);
  const [tbDate, setTbDate] = React.useState("");
  const [tbTime, setTbTime] = React.useState("19:30");
  const [tbGuests, setTbGuests] = React.useState("2");
  const [tbSeating, setTbSeating] = React.useState("No preference");

  const set = React.useCallback((key: keyof SiteContent) => (value: string) => onContentChange?.({ [key]: value }), [onContentChange]);
  const setStyle = React.useCallback(
    (styleId: string, patch: Partial<NonNullable<SiteContent["textStyles"]>[string]>) => {
      onContentChange?.({
        textStyles: { ...content.textStyles, [styleId]: patch },
      });
    },
    [content.textStyles, onContentChange],
  );

  const logoDisplay = content.logoDisplay ?? "both";
  const showRooms = isSectionEnabled(content, "rooms");
  const showCabins = isSectionEnabled(content, "cabins") && cabins.length > 0;
  const showRestaurant = isSectionEnabled(content, "restaurant") && menuItems.length > 0;
  const showTestimonials = isSectionEnabled(content, "testimonials") && testimonials.length > 0;
  const showAmenities = isSectionEnabled(content, "amenities") && amenities.length > 0;
  const showGallery = isSectionEnabled(content, "gallery") && galleryImages.length > 0;
  const topPickRooms = roomTypes.filter((r) => r.isTopPick);

  const gallerySections = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const img of galleryImages) {
      const list = map.get(img.section) ?? [];
      list.push(img.url);
      map.set(img.section, list);
    }
    return [...map.entries()];
  }, [galleryImages]);

  const categories = React.useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const list = map.get(item.categoryName) ?? [];
      list.push(item);
      map.set(item.categoryName, list);
    }
    return [...map.entries()];
  }, [menuItems]);

  function effectivePrice(item: MenuItem) {
    return Math.max(item.price - (item.discount ?? 0), 0);
  }

  function sendTableBookingOnWhatsApp(details: { name: string; phone: string; notes: string }) {
    const message = [`Table reservation request for ${hotel.name}:`, `Name: ${details.name}`, `Phone: ${details.phone}`, `Date: ${tbDate || "flexible"}`, `Time: ${tbTime}`, `Guests: ${tbGuests}`, `Seating: ${tbSeating}`, details.notes ? `Notes: ${details.notes}` : undefined].filter(Boolean).join("\n");
    window.open(waLink(hotel.phoneNumber, message), "_blank", "noopener,noreferrer");
  }

  function requestStayBooking(stay: RoomType | Cabin) {
    const message = [`Booking request for ${hotel.name}:`, `- ${stay.name}`, `Check-in: ${checkIn || "flexible"}`, `Check-out: ${checkOut || "flexible"}`, `Guests: ${guests}`].join("\n");
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

  function goTo(target: Page) {
    if (basePath) {
      router.push(pageHref(basePath, target));
    } else {
      setInternalPage(target);
    }
    setMobileNavOpen(false);
  }

  const homeSections: Record<HomeSectionId, () => React.ReactNode> = {
    about: () => (
      <section key="about" className="px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-12">
          <EditableImage
            src={content.aboutImageUrl || galleryImages[0]?.url}
            fileId={content.aboutImageFileId}
            editable={editable}
            onChange={(url, fileId) =>
              onContentChange?.({
                aboutImageUrl: url,
                aboutImageFileId: fileId,
              })
            }
            folder="/hotel-website"
            className="h-80 w-full overflow-hidden rounded-2xl sm:h-[28rem]"
          />
          <div className="flex flex-col gap-4">
            <EditableText value={content.aboutHeading} onChange={editable ? set("aboutHeading") : undefined} editable={editable} as="h2" className="font-[family-name:var(--font-display)] text-3xl font-semibold" styleId="aboutHeading" style={content.textStyles?.aboutHeading} onStyleChange={editable ? setStyle : undefined} />
            <EditableText value={content.aboutBody} onChange={editable ? set("aboutBody") : undefined} editable={editable} as="p" multiline className="text-[var(--site-muted)]" styleId="aboutBody" style={content.textStyles?.aboutBody} onStyleChange={editable ? setStyle : undefined} />
          </div>
        </div>
      </section>
    ),
    topPicks: () =>
      topPickRooms.length > 0 ? (
        <section key="topPicks" className="border-t border-[var(--site-border)] px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-[var(--site-primary)] uppercase">
              <StarIcon className="size-3.5 fill-current" />
              Top picks
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">Guest favorites</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topPickRooms.slice(0, 4).map((room) => (
                <button key={room.id} type="button" onClick={() => (basePath ? router.push(pageHref(basePath, "room-detail", room.id)) : goTo("rooms"))} className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] text-left">
                  <div className="aspect-square overflow-hidden">
                    {room.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                      <img src={room.images[0]} alt={room.name} className={cnImg("transition-transform duration-500 group-hover:scale-105")} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <span className="line-clamp-1 font-medium">{room.name}</span>
                    <span className="text-sm font-semibold text-[var(--site-primary)]">{formatMoney(room.basePrice)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null,
    rooms: () =>
      showRooms ? (
        <section key="rooms" className="border-t border-[var(--site-border)] px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <EditableText value={content.roomsHeading} onChange={editable ? set("roomsHeading") : undefined} editable={editable} as="h2" className="font-[family-name:var(--font-display)] text-3xl font-semibold" styleId="roomsHeading" style={content.textStyles?.roomsHeading} onStyleChange={editable ? setStyle : undefined} />
                <EditableText value={content.roomsSubheading} onChange={editable ? set("roomsSubheading") : undefined} editable={editable} as="p" className="text-[var(--site-muted)]" styleId="roomsSubheading" style={content.textStyles?.roomsSubheading} onStyleChange={editable ? setStyle : undefined} />
              </div>
              {roomTypes.length > 0 && (
                <Button variant="outline" className="rounded-full border-[var(--site-border)] bg-transparent hover:bg-[var(--site-primary)]/10" onClick={() => goTo("rooms")}>
                  View all rooms
                </Button>
              )}
            </div>
            {roomTypes.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {roomTypes.slice(0, 3).map((room) => (
                  <StayCard key={room.id} stay={room} kind="rooms" basePath={basePath} formatMoney={formatMoney} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--site-border)] p-10 text-center text-sm text-[var(--site-muted)]">Room types will appear here once they&apos;re added.</div>
            )}
          </div>
        </section>
      ) : null,
    cabins: () =>
      showCabins ? (
        <section key="cabins" className="border-t border-[var(--site-border)] bg-[var(--site-card)] px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <EditableText value={content.cabinsHeading} onChange={editable ? set("cabinsHeading") : undefined} editable={editable} as="h2" className="font-[family-name:var(--font-display)] text-3xl font-semibold" styleId="cabinsHeading" style={content.textStyles?.cabinsHeading} onStyleChange={editable ? setStyle : undefined} />
                <EditableText value={content.cabinsSubheading} onChange={editable ? set("cabinsSubheading") : undefined} editable={editable} as="p" className="text-[var(--site-muted)]" styleId="cabinsSubheading" style={content.textStyles?.cabinsSubheading} onStyleChange={editable ? setStyle : undefined} />
              </div>
              <Button variant="outline" className="rounded-full border-[var(--site-border)] bg-transparent hover:bg-[var(--site-primary)]/10" onClick={() => goTo("cabins")}>
                View all cabins
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cabins.slice(0, 3).map((cabin) => (
                <StayCard key={cabin.id} stay={cabin} kind="cabins" basePath={basePath} formatMoney={formatMoney} />
              ))}
            </div>
          </div>
        </section>
      ) : null,
    testimonials: () =>
      showTestimonials ? (
        <section key="testimonials" className="border-t border-[var(--site-border)] px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold">What guests say</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {testimonials.slice(0, 6).map((t) => (
                <div key={t.id} className="flex flex-col gap-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-6">
                  <div className="flex gap-0.5 text-[var(--site-primary)]">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                      <StarIcon key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-auto flex flex-col text-sm">
                    <span className="font-medium">{t.guestName}</span>
                    {t.stayLabel && <span className="text-xs text-[var(--site-muted)]">{t.stayLabel}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null,
    amenities: () =>
      showAmenities ? (
        <section key="amenities" className="border-t border-[var(--site-border)] bg-[var(--site-card)] px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">Amenities</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {amenities.map((label) => (
                <span key={label} className="text-sm font-medium">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null,
  };

  return (
    <div ref={rootRef} className="flex min-h-full flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--site-border)] bg-[var(--site-bg)]/95 px-6 py-4 backdrop-blur sm:px-10">
        <div className="flex items-center gap-2.5">
          {logoDisplay !== "text" && (
            <EditableImage
              src={content.logoUrl || hotel.logoUrl}
              fileId={content.logoFileId}
              editable={editable}
              onChange={(url, fileId) => onContentChange?.({ logoUrl: url, logoFileId: fileId })}
              folder="/hotel-website"
              className={logoDisplay === "logo" ? "h-9 w-40 shrink-0" : "size-9 shrink-0 overflow-hidden rounded-full"}
              imgClassName="object-contain object-left"
              fallback={<span className={logoDisplay === "logo" ? "h-9 w-40" : "size-9"} />}
            />
          )}
          {logoDisplay !== "logo" && (
            <button type="button" onClick={() => goTo("home")} className="cursor-pointer font-[family-name:var(--font-display)] text-lg font-semibold">
              {hotel.name}
            </button>
          )}
        </div>

        <div className="hidden items-center gap-7 text-sm md:flex">
          {NAV.map((item) => (
            <button key={item.id} type="button" onClick={() => goTo(item.id)} className={page === item.id ? "font-medium text-[var(--site-primary)]" : "cursor-pointer text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Button size="sm" className="hidden rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90 sm:inline-flex" onClick={() => goTo("contact")}>
            <EditableText value={content.ctaPrimaryLabel} onChange={editable ? set("ctaPrimaryLabel") : undefined} editable={editable} />
          </Button>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="hover:bg-[var(--site-primary)]/10 md:hidden" aria-label="Menu">
                  <MenuIcon />
                </Button>
              }
            />
            <SheetContent side="right" container={rootRef} className="bg-[var(--site-bg)] p-0 text-[var(--site-fg)]">
              <SheetTitle className="sr-only">Site navigation</SheetTitle>
              <div className="flex flex-col gap-1 p-6">
                {NAV.map((item) => (
                  <button key={item.id} type="button" onClick={() => goTo(item.id)} className={page === item.id ? "rounded-lg bg-[var(--site-primary)]/10 px-3 py-2.5 text-left font-medium text-[var(--site-primary)]" : "cursor-pointer rounded-lg px-3 py-2.5 text-left text-[var(--site-muted)] hover:bg-[var(--site-primary)]/10"}>
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
          <section className="px-6 py-16 sm:px-10 sm:py-20">
            <div className="mx-auto w-full max-w-7xl">
              <div className="relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-[2rem] sm:min-h-[32rem] lg:min-h-[38rem]">
                <EditableImage
                  src={content.heroImageUrl || hotel.logoUrl}
                  fileId={content.heroImageFileId}
                  editable={editable}
                  onChange={(url, fileId) =>
                    onContentChange?.({
                      heroImageUrl: url,
                      heroImageFileId: fileId,
                    })
                  }
                  folder="/hotel-website"
                  className="absolute inset-0"
                  imgClassName="size-full object-cover"
                  fallback={<div className="absolute inset-0 size-full bg-[var(--site-primary)]/15" />}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="relative flex flex-col gap-4 p-8 pb-16 text-white sm:p-14 sm:pb-20">
                  <EditableText value={content.heroEyebrow} onChange={editable ? set("heroEyebrow") : undefined} editable={editable} as="span" className="text-xs font-medium tracking-[0.2em] text-white/80 uppercase" />
                  <EditableText value={content.heroHeading} onChange={editable ? set("heroHeading") : undefined} editable={editable} as="h1" className="max-w-2xl text-balance font-[family-name:var(--font-display)] text-4xl leading-[1.05] font-semibold sm:text-6xl" styleId="heroHeading" style={content.textStyles?.heroHeading} onStyleChange={editable ? setStyle : undefined} />
                  <EditableText value={content.heroSubheading} onChange={editable ? set("heroSubheading") : undefined} editable={editable} as="p" multiline className="max-w-lg text-balance text-white/85" styleId="heroSubheading" style={content.textStyles?.heroSubheading} onStyleChange={editable ? setStyle : undefined} />
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90" onClick={() => goTo("contact")}>
                      <EditableText value={content.ctaPrimaryLabel} onChange={editable ? set("ctaPrimaryLabel") : undefined} editable={editable} />
                    </Button>
                    {showRooms && (
                      <Button size="lg" variant="outline" className="rounded-full border-white/50 bg-transparent text-white hover:bg-white/10" onClick={() => goTo("rooms")}>
                        <EditableText value={content.ctaSecondaryLabel} onChange={editable ? set("ctaSecondaryLabel") : undefined} editable={editable} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 -mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--site-card)] p-5 shadow-xl ring-1 ring-[var(--site-border)] sm:-mt-9 sm:grid-cols-5 sm:items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Check-in</span>
                  <DatePicker value={checkIn} onChange={setCheckIn} placeholder="Add date" className="bg-transparent" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Check-out</span>
                  <DatePicker value={checkOut} onChange={setCheckOut} placeholder="Add date" className="bg-transparent" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Guests</span>
                  <Input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} className="bg-transparent" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Rooms</span>
                  <Input type="number" min={1} defaultValue={1} className="bg-transparent" />
                </div>
                <Button className="col-span-2 w-full justify-center gap-2 rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90 sm:col-span-1 sm:w-auto" onClick={() => goTo(showRooms ? "rooms" : "contact")}>
                  <SearchIcon className="size-4" />
                  Search availability
                </Button>
              </div>
            </div>
          </section>

          {homeSectionOrder(content).map((id) => homeSections[id]())}

          {isSectionEnabled(content, "contact") && (
            <section className="px-6 py-16 sm:px-10 sm:py-20">
              <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-3 overflow-hidden rounded-[2rem] bg-[var(--site-primary)] px-6 py-16 text-center text-[var(--site-primary-fg)] sm:py-24">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 -left-16 size-64 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute top-0 right-0 size-72 rounded-full bg-black/15 blur-3xl" />
                  <div className="absolute bottom-0 left-1/3 size-56 rounded-full bg-white/10 blur-3xl" />
                </div>
                <div className="relative flex flex-col items-center gap-3">
                  <EditableText
                    value={content.contactHeading}
                    onChange={editable ? set("contactHeading") : undefined}
                    editable={editable}
                    as="h2"
                    className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl"
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
                    className="max-w-md text-sm opacity-85 sm:text-base"
                    styleId="contactBody"
                    style={content.textStyles?.contactBody}
                    onStyleChange={editable ? setStyle : undefined}
                  />
                  <Button size="lg" className="mt-2 rounded-full bg-black/80 text-white hover:bg-black/90" onClick={() => goTo("contact")}>
                    Contact us
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {page === "rooms" && showRooms && (
        <div className="flex flex-col gap-8 px-6 py-14 sm:px-10">
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
            <div className="rounded-2xl border border-dashed border-[var(--site-border)] p-10 text-center text-sm text-[var(--site-muted)]">Room types will appear here once they&apos;re added.</div>
          )}
        </div>
      )}

      {page === "cabins" && showCabins && (
        <div className="flex flex-col gap-8 px-6 py-14 sm:px-10">
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
          if (!stay) return <div className="px-6 py-14 sm:px-10">Not found.</div>;
          const related = list.filter((s) => s.id !== stay.id).slice(0, 2);
          return (
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 sm:py-14">
              <Button variant="ghost" className="w-fit rounded-full hover:bg-[var(--site-primary)]/10" nativeButton={!basePath} render={basePath ? <Link href={pageHref(basePath, kind)} /> : undefined}>
                <ArrowLeftIcon className="mr-1.5 size-4" />
                All {kind}
              </Button>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
                <div className="flex flex-col gap-6">
                  <div className="overflow-hidden rounded-3xl border border-[var(--site-border)] bg-[var(--site-primary)]/10">
                    {stay.images[activeImage] && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                      <img src={stay.images[activeImage]} alt={stay.name} className="aspect-4/3 w-full object-cover" />
                    )}
                  </div>
                  {stay.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {stay.images.map((img, i) => (
                        <button key={img + i} type="button" onClick={() => setActiveImage(i)} className={i === activeImage ? "overflow-hidden rounded-xl border-2 border-[var(--site-primary)]" : "cursor-pointer overflow-hidden rounded-xl border-2 border-transparent hover:border-[var(--site-border)]"}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                          <img src={img} alt="" className="aspect-4/3 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">{stay.name}</h1>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--site-muted)]">
                      <span className="flex items-center gap-1.5">
                        <UsersIcon className="size-4" />
                        Sleeps {stay.capacity}
                      </span>
                      {"pricingLabel" in stay && stay.pricingLabel && <span>{stay.pricingLabel}</span>}
                    </div>
                    {stay.description && <p className="text-[var(--site-muted)]">{stay.description}</p>}
                    {stay.amenities.length > 0 && (
                      <>
                        <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold">Amenities</h2>
                        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {stay.amenities.map((a) => (
                            <li key={a} className="flex items-center gap-2.5 text-sm">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--site-primary)]/10 text-[var(--site-primary)]">
                                <CheckIcon className="size-3.5" />
                              </span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
                <aside className="h-fit lg:sticky lg:top-10">
                  <div className="flex flex-col gap-3 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-5 sm:p-6">
                    <p className="text-sm text-[var(--site-muted)]">
                      <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--site-fg)]">{formatMoney(stay.basePrice)}</span> / night
                    </p>
                    <span className="text-xs font-medium text-[var(--site-muted)]">Check-in</span>
                    <DatePicker value={checkIn} onChange={setCheckIn} placeholder="Add date" className="bg-transparent" />
                    <span className="text-xs font-medium text-[var(--site-muted)]">Check-out</span>
                    <DatePicker value={checkOut} onChange={setCheckOut} placeholder="Add date" className="bg-transparent" />
                    <span className="text-xs font-medium text-[var(--site-muted)]">Guests</span>
                    <Input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} className="bg-transparent" />
                    <Button className="mt-1 rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90" onClick={() => requestStayBooking(stay)}>
                      Request booking
                    </Button>
                  </div>
                </aside>
              </div>
              {related.length > 0 && (
                <div className="mt-4 flex flex-col gap-5">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">You may also like</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {related.map((s) => (
                      <Link key={s.id} href={pageHref(basePath, kind === "rooms" ? "room-detail" : "cabin-detail", s.id)} className="group grid grid-cols-[7rem_1fr] items-center gap-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] p-3 sm:grid-cols-[9rem_1fr]">
                        {s.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                          <img src={s.images[0]} alt={s.name} className="aspect-4/3 w-full rounded-xl object-cover" />
                        ) : (
                          <div className="aspect-4/3 w-full rounded-xl bg-[var(--site-primary)]/10" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{s.name}</p>
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
        <div className="flex flex-col gap-14 px-6 py-14 sm:px-10">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">{content.galleryHeading}</h1>
          {gallerySections.map(([section, urls]) => (
            <div key={section} className="flex flex-col gap-6">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">{section}</h2>
              <GalleryBento images={urls} containerRef={rootRef} />
            </div>
          ))}
        </div>
      )}

      {page === "restaurant" && showRestaurant && (
        <div className="flex flex-col gap-10 px-6 py-14 pb-28 sm:px-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">{content.restaurantHeading}</h1>
            <p className="text-[var(--site-muted)]">{content.restaurantSubheading}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(([categoryName]) => (
              <a key={categoryName} href={`#menu-${categoryName}`} className="shrink-0 rounded-full border border-[var(--site-border)] px-3.5 py-1.5 text-sm whitespace-nowrap hover:bg-[var(--site-primary)]/10">
                {categoryName}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-10">
            {categories.map(([categoryName, items]) => (
              <div key={categoryName} id={`menu-${categoryName}`} className="flex scroll-mt-20 flex-col gap-4">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{categoryName}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => (
                    <button key={item.id} type="button" onClick={() => setSelectedDish(item)} className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-card)] text-left transition-colors hover:bg-[var(--site-primary)]/5">
                      <div className="h-56 w-full shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                          <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-[var(--site-primary)]/10" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <span className="flex items-center gap-2 font-medium">
                          <span className={`size-2 shrink-0 rounded-full ${FOOD_TYPE_DOT[item.foodType] ?? "bg-muted-foreground"}`} />
                          <span className="line-clamp-1">{item.name}</span>
                          {item.isTopPick && <Badge className="shrink-0 bg-[var(--site-primary)] text-[var(--site-primary-fg)]">Top pick</Badge>}
                        </span>
                        <p className="line-clamp-2 min-h-10 text-sm text-[var(--site-muted)]">{item.description}</p>
                        <span className="mt-auto pt-2 font-medium text-[var(--site-primary)]">{formatMoney(effectivePrice(item))}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "table-booking" && showRestaurant && (
        <div className="flex flex-col gap-8 px-6 py-14 sm:px-10">
          <div className="flex max-w-xl flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">Book a table</h1>
            <p className="text-[var(--site-muted)]">Send us your details and we&apos;ll confirm your table over WhatsApp.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            <form
              className="flex flex-col gap-4 rounded-3xl border border-[var(--site-border)] bg-[var(--site-card)] p-5 sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                const data2 = new FormData(e.currentTarget);
                sendTableBookingOnWhatsApp({
                  name: String(data2.get("name") ?? ""),
                  phone: String(data2.get("phone") ?? ""),
                  notes: String(data2.get("notes") ?? ""),
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
                  <DatePicker value={tbDate} onChange={setTbDate} placeholder="Pick a date" className="bg-transparent" minDate={new Date(new Date().setHours(0, 0, 0, 0))} disabledDaysOfWeek={tbClosedDays} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Time</span>
                  <Select value={tbTime} onValueChange={(v) => setTbTime(v ?? tbTime)}>
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tbTimeSlots.map((t) => (
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
                      <SelectItem value="No preference">No preference</SelectItem>
                      {sections.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-[var(--site-muted)]">Notes (allergies, occasion)</span>
                  <Textarea name="notes" rows={4} className="bg-transparent" />
                </div>
              </div>
              <Button type="submit" className="mt-1 w-fit rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90">
                Request reservation
              </Button>
            </form>
            <aside className="flex h-fit flex-col gap-4 rounded-3xl border border-[var(--site-border)] bg-[var(--site-card)] p-6 text-sm">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Good to know</h2>
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

      {page === "contact" && (
        <div className="flex flex-col gap-10 px-6 py-14 sm:px-10">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
            <EditableText value={content.contactHeading} onChange={editable ? set("contactHeading") : undefined} editable={editable} as="h1" className="font-[family-name:var(--font-display)] text-4xl font-semibold" styleId="contactHeading" style={content.textStyles?.contactHeading} onStyleChange={editable ? setStyle : undefined} />
            <EditableText value={content.contactBody} onChange={editable ? set("contactBody") : undefined} editable={editable} as="p" multiline className="text-[var(--site-muted)]" styleId="contactBody" style={content.textStyles?.contactBody} onStyleChange={editable ? setStyle : undefined} />
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              {coords ? (
                <iframe title="Location map" src={googleMapEmbedSrc(coords.lat, coords.lng)} className="aspect-video w-full rounded-2xl border-0" loading="lazy" />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-2xl bg-[var(--site-card)] text-[var(--site-muted)]">
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
                <Input placeholder="Name" />
                <Input placeholder="Email" type="email" />
              </div>
              <Input placeholder="Phone" />
              <Input placeholder="Subject" />
              <Textarea placeholder="Message" rows={4} />
              <Button type="submit" className="w-fit rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] hover:bg-[var(--site-primary)]/90">
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
      <footer className="mt-auto bg-[var(--site-fg)] px-6 py-14 text-[var(--site-bg)]/60 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--site-bg)]">{hotel.name}</span>
              {hotel.description && <p className="max-w-xs text-sm">{hotel.description}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-[var(--site-bg)]">Explore</span>
              <FooterLink onClick={() => goTo("home")}>Home</FooterLink>
              {showRooms && <FooterLink onClick={() => goTo("rooms")}>Rooms</FooterLink>}
              {showCabins && <FooterLink onClick={() => goTo("cabins")}>Cabins</FooterLink>}
              {showGallery && <FooterLink onClick={() => goTo("gallery")}>Gallery</FooterLink>}
            </div>
            {showRestaurant && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-[var(--site-bg)]">Dining</span>
                <FooterLink onClick={() => goTo("restaurant")}>Menu</FooterLink>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-[var(--site-bg)]">Get in touch</span>
              {hotel.address && (
                <span className="flex items-start gap-1.5 text-sm">
                  <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
                  {hotel.address}
                </span>
              )}
              <FooterLink href={`tel:${hotel.phoneNumber}`}>
                <PhoneIcon className="size-3.5 shrink-0" />
                {hotel.phoneNumber}
              </FooterLink>
              {hotel.email && (
                <FooterLink href={`mailto:${hotel.email}`}>
                  <MailIcon className="size-3.5 shrink-0" />
                  {hotel.email}
                </FooterLink>
              )}
              <FooterLink href={waLink(hotel.phoneNumber)} external>
                <WhatsAppIcon className="size-3.5 shrink-0" />
                WhatsApp
              </FooterLink>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--site-bg)]/10 pt-6 text-xs sm:flex-row">
            <span>
              © {new Date().getFullYear()} {hotel.name}. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      <a href={waLink(hotel.phoneNumber)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed right-4 bottom-4 z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 sm:right-6 sm:bottom-6">
        <WhatsAppIcon className="size-7" />
      </a>

      <Dialog open={!!selectedDish} onOpenChange={(open) => !open && setSelectedDish(null)}>
        <DialogContent container={rootRef} className="max-w-md gap-4 overflow-hidden p-0" showCloseButton>
          {selectedDish && (
            <>
              <div className="h-48 w-full shrink-0 overflow-hidden">
                {selectedDish.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                  <img src={selectedDish.imageUrl} alt={selectedDish.name} className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-[var(--site-primary)]/10" />
                )}
              </div>
              <div className="flex flex-col gap-3 p-6 pt-0">
                <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--site-fg)]">
                  <span className={`size-2 shrink-0 rounded-full ${FOOD_TYPE_DOT[selectedDish.foodType] ?? "bg-muted-foreground"}`} />
                  {selectedDish.name}
                  {selectedDish.isTopPick && <Badge className="bg-[var(--site-primary)] text-[var(--site-primary-fg)]">Top pick</Badge>}
                </DialogTitle>
                {selectedDish.description && <p className="text-sm text-[var(--site-muted)]">{selectedDish.description}</p>}
                {selectedDish.ingredients && (
                  <p className="text-xs text-[var(--site-muted)]">
                    <span className="font-medium text-[var(--site-fg)]">Ingredients: </span>
                    {selectedDish.ingredients}
                  </p>
                )}
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--site-primary)]">{formatMoney(effectivePrice(selectedDish))}</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
