import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import type { Hotel } from "@/features/hotel/types";

export function FooterSection({ hotel }: { hotel: Hotel }) {
  return (
    <footer className="flex flex-col gap-4 rounded-2xl border bg-card px-6 py-8 text-sm text-muted-foreground">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <span className="font-heading text-base font-semibold text-foreground">{hotel.name}</span>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-5">
          {(hotel.address || hotel.city) && (
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5 shrink-0" />
              {[hotel.address, hotel.city].filter(Boolean).join(", ")}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <PhoneIcon className="size-3.5 shrink-0" />
            {hotel.phoneNumber}
          </span>
          {hotel.email && (
            <span className="flex items-center gap-1.5">
              <MailIcon className="size-3.5 shrink-0" />
              {hotel.email}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs">
        &copy; {new Date().getFullYear()} {hotel.name}. All rights reserved.
      </p>
    </footer>
  );
}
