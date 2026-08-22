"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, MinusIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearchWidget({ basePath }: { basePath: string }) {
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
      className="relative z-10 mx-4 -mt-8 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-stone-900/10 ring-1 ring-stone-200 sm:mx-6 sm:-mt-9 sm:grid-cols-2 sm:p-5 lg:mx-10 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end lg:gap-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
          <CalendarIcon className="size-3.5" />
          Check-in
        </span>
        <Input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="h-11 bg-transparent"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
          <CalendarIcon className="size-3.5" />
          Check-out
        </span>
        <Input
          type="date"
          value={checkOut}
          min={checkIn || undefined}
          onChange={(e) => setCheckOut(e.target.value)}
          className="h-11 bg-transparent"
        />
      </label>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-stone-500">Guests</span>
        <div className="flex h-11 items-center justify-between rounded-md border border-stone-200 px-2.5">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            aria-label="Decrease guests"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-600 hover:bg-stone-100"
          >
            <MinusIcon className="size-3.5" />
          </button>
          <span className="min-w-6 text-center text-sm font-medium tabular-nums">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(12, g + 1))}
            aria-label="Increase guests"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-600 hover:bg-stone-100"
          >
            <PlusIcon className="size-3.5" />
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="h-11 gap-2 rounded-full bg-amber-700 px-6 text-white hover:bg-amber-800 sm:col-span-2 lg:col-span-1"
      >
        <SearchIcon className="size-4" />
        Search availability
      </Button>
    </form>
  );
}
