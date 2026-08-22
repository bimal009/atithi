"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { waLink } from "./whatsapp-icon";

export function TableBookingForm({ hotelName, hotelPhone }: { hotelName: string; hotelPhone: string }) {
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("19:30");
  const [guests, setGuests] = React.useState("2");
  const [seating, setSeating] = React.useState("No preference");

  function sendTableBookingOnWhatsApp(details: { name: string; phone: string; notes: string }) {
    const message = [
      `Table reservation request for ${hotelName}:`,
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Date: ${date || "flexible"}`,
      `Time: ${time}`,
      `Guests: ${guests}`,
      `Seating: ${seating}`,
      details.notes ? `Notes: ${details.notes}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(hotelPhone, message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
      <form
        className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          sendTableBookingOnWhatsApp({
            name: String(data.get("name") ?? ""),
            phone: String(data.get("phone") ?? ""),
            notes: String(data.get("notes") ?? ""),
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Full name</span>
            <Input name="name" required placeholder="Your name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Phone</span>
            <Input name="phone" required placeholder="Your phone" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Date</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-stone-500">Time</span>
            <Select value={time} onValueChange={(v) => setTime(v ?? time)}>
              <SelectTrigger className="w-full">
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
            <span className="text-xs font-medium text-stone-500">Guests</span>
            <Select value={guests} onValueChange={(v) => setGuests(v ?? guests)}>
              <SelectTrigger className="w-full">
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
            <span className="text-xs font-medium text-stone-500">Seating</span>
            <Select value={seating} onValueChange={(v) => setSeating(v ?? seating)}>
              <SelectTrigger className="w-full">
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
            <span className="text-xs font-medium text-stone-500">Notes (allergies, occasion)</span>
            <Textarea name="notes" rows={4} />
          </div>
        </div>
        <Button type="submit" className="mt-1 w-fit rounded-full bg-amber-700 text-white hover:bg-amber-800">
          Request reservation
        </Button>
      </form>

      <aside className="flex h-fit flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-6 text-sm">
        <div>
          <h2 className="font-[family-name:var(--font-site-display)] text-lg font-semibold text-stone-900">
            Good to know
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-stone-500">
            <li>We&apos;ll confirm your table over WhatsApp shortly after you send it</li>
            <li>Large groups — please call us directly</li>
            <li>Let us know about allergies or dietary needs in the notes</li>
          </ul>
        </div>
        <div className="border-t border-stone-200 pt-4 text-stone-500">
          <p className="font-medium text-stone-900">Call the restaurant</p>
          <p className="mt-1">{hotelPhone}</p>
        </div>
      </aside>
    </div>
  );
}
