"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, MinusIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearchWidget2({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guests, setGuests] = React.useState(2);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`${basePath}/rooms`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end lg:gap-6"
    >
      <label className="flex flex-col gap-2 border-b border-[#17181A]/15 pb-2">
        <span className="flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-[#17181A]/45 uppercase">
          <CalendarIcon className="size-3.5" strokeWidth={1.75} />
          Check-in
        </span>
        <Input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="h-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </label>
      <label className="flex flex-col gap-2 border-b border-[#17181A]/15 pb-2">
        <span className="flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-[#17181A]/45 uppercase">
          <CalendarIcon className="size-3.5" strokeWidth={1.75} />
          Check-out
        </span>
        <Input
          type="date"
          value={checkOut}
          min={checkIn || undefined}
          onChange={(e) => setCheckOut(e.target.value)}
          className="h-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </label>
      <div className="flex flex-col gap-2 border-b border-[#17181A]/15 pb-2">
        <span className="text-xs font-medium tracking-[0.1em] text-[#17181A]/45 uppercase">Guests</span>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            aria-label="Decrease guests"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#17181A]/70 hover:bg-[#17181A]/5"
          >
            <MinusIcon className="size-3.5" />
          </button>
          <span className="min-w-6 text-center text-sm font-medium tabular-nums">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(12, g + 1))}
            aria-label="Increase guests"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#17181A]/70 hover:bg-[#17181A]/5"
          >
            <PlusIcon className="size-3.5" />
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="h-11 gap-2 rounded-sm bg-[#17181A] px-6 text-white hover:bg-[#17181A]/85 sm:col-span-2 lg:col-span-1"
      >
        <SearchIcon className="size-4" />
        Search availability
      </Button>
    </form>
  );
}
