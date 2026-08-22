import { useState, type RefObject } from "react";
import { ChevronLeftIcon, ChevronRightIcon, DumbbellIcon, SparklesIcon, UtensilsIcon, WavesIcon, WifiIcon } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { Page } from "../types";

export function pageHref(basePath: string | undefined, target: Page, id?: string) {
  const segment =
    target === "restaurant"
      ? "menu"
      : target === "room-detail"
        ? `rooms/${id}`
        : target === "cabin-detail"
          ? `cabins/${id}`
          : target;
  return target === "home" ? (basePath ?? "") : `${basePath}/${segment}`;
}

export function GalleryBento({
  images,
  radius = "rounded-2xl",
  containerRef,
}: {
  images: string[];
  radius?: string;
  containerRef?: RefObject<HTMLElement | null>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((url, i) => (
          <button
            key={url + i}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label="View photo"
            className={`group aspect-square cursor-pointer overflow-hidden ${radius}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
            <img src={url} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent container={containerRef} className="max-w-4xl border-none bg-transparent p-0 shadow-none ring-0" showCloseButton>
          {openIndex !== null && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
              <img src={images[openIndex]} alt="" className="max-h-[80vh] w-full rounded-lg object-contain" />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length))}
                    aria-label="Previous photo"
                    className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeftIcon className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length))}
                    aria-label="Next photo"
                    className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRightIcon className="size-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.986.55 3.834 1.503 5.415L2 22l4.68-1.472A9.96 9.96 0 0 0 12.004 22c5.518 0 10.004-4.486 10.004-9.996S17.522 2 12.004 2Zm0 18.15a8.1 8.1 0 0 1-4.318-1.246l-.31-.188-3.02.951.978-2.94-.202-.32a8.14 8.14 0 0 1-1.28-4.402c0-4.503 3.667-8.166 8.152-8.166 4.484 0 8.15 3.663 8.15 8.166 0 4.503-3.666 8.145-8.15 8.145Z" />
    </svg>
  );
}

export function waLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function parseLatLng(mapUrl?: string): { lat: number; lng: number } | null {
  if (!mapUrl) return null;
  const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/];
  for (const pattern of patterns) {
    const match = mapUrl.match(pattern);
    if (match) return { lat: Number(match[1]), lng: Number(match[2]) };
  }
  return null;
}

export function googleMapEmbedSrc(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}

/** Half-hour slots covering the full day — used when the hotel hasn't set opening/closing hours. */
export const ALL_DAY_TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

/** Half-hour slots between the hotel's configured opening/closing time, wrapping past midnight if closing < opening. */
export function timeSlotsBetween(opening?: string, closing?: string): string[] {
  if (!opening || !closing) return ALL_DAY_TIME_SLOTS;

  const toIndex = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 2 + (m >= 30 ? 1 : 0);
  };

  const start = toIndex(opening);
  const end = toIndex(closing);
  const count = end > start ? end - start : 48 - start + end;
  if (count <= 0) return ALL_DAY_TIME_SLOTS;

  return Array.from({ length: count + 1 }, (_, i) => ALL_DAY_TIME_SLOTS[(start + i) % 48]);
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** react-day-picker `dayOfWeek` indices (0 = Sunday) for days not in `openDays`. */
export function closedWeekdayIndices(openDays?: string[]): number[] {
  if (!openDays || openDays.length === 0) return [];
  return WEEKDAYS.map((_, i) => i).filter((i) => !openDays.includes(WEEKDAYS[i]));
}

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

export function amenityIcon(label: string) {
  const key = Object.keys(AMENITY_ICONS).find((k) => label.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : SparklesIcon;
}

export const FOOD_TYPE_DOT: Record<string, string> = {
  veg: "bg-emerald-500",
  vegan: "bg-emerald-600",
  "non-veg": "bg-red-500",
  egg: "bg-amber-500",
};
