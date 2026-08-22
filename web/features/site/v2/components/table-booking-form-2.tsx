"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { waLink } from "../../components/whatsapp-icon";

export function TableBookingForm2({ hotelName, hotelPhone }: { hotelName: string; hotelPhone: string }) {
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
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
      <form
        className="flex flex-col gap-4"
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
            <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">Full name</span>
            <Input name="name" required placeholder="Your name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">Phone</span>
            <Input name="phone" required placeholder="Your phone" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">Date</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">Time</span>
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
            <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">Guests</span>
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
            <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">Seating</span>
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
            <span className="text-xs font-medium tracking-wide text-[#17181A]/50 uppercase">
              Notes (allergies, occasion)
            </span>
            <Textarea name="notes" rows={4} />
          </div>
        </div>
        <Button type="submit" className="mt-2 w-fit rounded-sm bg-[#17181A] text-white hover:bg-[#17181A]/85">
          Request reservation
        </Button>
      </form>

      <aside className="flex h-fit flex-col gap-4 border-t border-[#17181A]/10 pt-8 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
        <div>
          <h2 className="font-[family-name:var(--font-site2-display)] text-lg font-semibold">Good to know</h2>
          <ul className="mt-3 flex flex-col gap-2 text-[#17181A]/55">
            <li>We&apos;ll confirm your table over WhatsApp shortly after you send it</li>
            <li>Large groups — please call us directly</li>
            <li>Let us know about allergies or dietary needs in the notes</li>
          </ul>
        </div>
        <div className="border-t border-[#17181A]/10 pt-4 text-[#17181A]/55">
          <p className="font-semibold text-[#17181A]">Call the restaurant</p>
          <p className="mt-1">{hotelPhone}</p>
        </div>
      </aside>
    </div>
  );
}
