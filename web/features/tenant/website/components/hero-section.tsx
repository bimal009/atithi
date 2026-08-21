import { MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Hotel } from "@/features/hotel/types";

export function HeroSection({ hotel }: { hotel: Hotel }) {
  return (
    <section className="relative flex min-h-[26rem] flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-primary/60 px-6 py-20 text-center text-primary-foreground">
      {hotel.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hotel.logoUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full scale-110 object-cover opacity-15 blur-sm"
        />
      )}
      <div className="relative flex flex-col items-center gap-5">
        {hotel.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.logoUrl}
            alt={hotel.name}
            className="size-16 rounded-xl bg-background/90 object-contain p-2 shadow-lg"
          />
        )}
        <h1 className="max-w-2xl text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {hotel.name}
        </h1>
        {hotel.description && (
          <p className="max-w-xl text-balance text-primary-foreground/85 sm:text-lg">
            {hotel.description}
          </p>
        )}
        {(hotel.address || hotel.city) && (
          <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
            <MapPinIcon className="size-4 shrink-0" />
            {[hotel.address, hotel.city].filter(Boolean).join(", ")}
          </span>
        )}
        <Button
          size="lg"
          variant="secondary"
          className="mt-2 rounded-full px-8"
          render={<a href={`tel:${hotel.phoneNumber}`} />}
        >
          Contact us
        </Button>
      </div>
    </section>
  );
}
