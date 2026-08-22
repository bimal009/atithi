"use client";

import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { dummyHotel } from "../../lib/dummy-data";

export function ContactPageContent2() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
        <h1 className="font-[family-name:var(--font-site2-display)] text-4xl font-semibold">
          Your stay starts here
        </h1>
        <p className="text-[#17181A]/55">Reach out and we&apos;ll help you plan the details.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <iframe
            title="Location map"
            src={dummyHotel.mapUrl}
            className="aspect-video w-full rounded-sm"
            loading="lazy"
          />
          <a
            href={dummyHotel.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-[#4B5D46] hover:underline"
          >
            <MapPinIcon className="size-4" />
            Get directions
          </a>
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
          <Button type="submit" className="w-fit rounded-sm bg-[#17181A] text-white hover:bg-[#17181A]/85">
            Send message
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-[#17181A]/10 pt-8 text-sm text-[#17181A]/60">
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="size-4" strokeWidth={1.75} />
          {dummyHotel.address}
        </span>
        <span className="flex items-center gap-1.5">
          <PhoneIcon className="size-4" strokeWidth={1.75} />
          {dummyHotel.phoneNumber}
        </span>
        <span className="flex items-center gap-1.5">
          <MailIcon className="size-4" strokeWidth={1.75} />
          {dummyHotel.email}
        </span>
      </div>
    </div>
  );
}
