"use client";

import * as React from "react";
import Link from "next/link";
import { BellIcon, MailIcon, MapPinIcon, MenuIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { dummyHotel } from "../lib/dummy-data";
import { siteFontClass } from "../lib/fonts";
import { waLink, WhatsAppIcon } from "./whatsapp-icon";

export type SitePageId = "home" | "rooms" | "cabins" | "gallery" | "menu" | "table-booking" | "contact";

const NAV: { id: SitePageId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "" },
  { id: "rooms", label: "Rooms", href: "/rooms" },
  { id: "cabins", label: "Cabins", href: "/cabins" },
  { id: "menu", label: "Restaurant", href: "/menu" },
  { id: "table-booking", label: "Table Booking", href: "/table-booking" },
  { id: "contact", label: "Contact", href: "/contact" },
];

const WhatsAppOffsetContext = React.createContext<(raised: boolean) => void>(() => {});

export function useWhatsAppOffset(raised: boolean) {
  const setRaised = React.useContext(WhatsAppOffsetContext);
  React.useEffect(() => {
    setRaised(raised);
    return () => setRaised(false);
  }, [raised, setRaised]);
}

export function SiteShell({
  tenant,
  active,
  children,
}: {
  tenant: string;
  active: SitePageId;
  children: React.ReactNode;
}) {
  const basePath = `/s/${tenant}`;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [whatsAppRaised, setWhatsAppRaised] = React.useState(false);

  return (
    <WhatsAppOffsetContext.Provider value={setWhatsAppRaised}>
      <div
        className={`${siteFontClass} flex min-h-screen flex-col bg-stone-50 text-stone-900 antialiased`}
        style={{ fontFamily: "var(--font-site-body)" }}
      >
        <nav className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
            <Link
              href={basePath}
              className="shrink-0 font-[family-name:var(--font-site-display)] text-lg font-semibold tracking-tight text-stone-900 sm:text-xl"
            >
              {dummyHotel.name}
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => {
                const isActive = active === item.id;
                return (
                  <Link
                    key={item.id}
                    href={`${basePath}${item.href}`}
                    className={
                      isActive
                        ? "rounded-full bg-amber-700/10 px-3.5 py-2 text-sm font-medium text-amber-800"
                        : "rounded-full px-3.5 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-900/5 hover:text-stone-900"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="relative text-stone-700 hover:bg-stone-900/5 hover:text-stone-900"
                      aria-label="Notifications"
                    />
                  }
                >
                  <BellIcon className="size-[18px]" />
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber-700" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72">
                  <span className="text-sm font-medium text-stone-900">Notifications</span>
                  <p className="mt-1 text-sm text-stone-500">
                    You&apos;ll see booking and order updates here once you reserve or place an order.
                  </p>
                </PopoverContent>
              </Popover>

              <Button
                size="sm"
                className="hidden rounded-full bg-amber-700 px-4 text-white hover:bg-amber-800 sm:inline-flex"
                nativeButton={false}
                render={<Link href={`${basePath}/rooms`} />}
              >
                Book your stay
              </Button>

              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-stone-700 hover:bg-stone-900/5 hover:text-stone-900 md:hidden"
                      aria-label="Open menu"
                    >
                      <MenuIcon />
                    </Button>
                  }
                />
                <SheetContent side="right" className="w-72 bg-stone-50 p-0 text-stone-900">
                  <SheetTitle className="sr-only">Site navigation</SheetTitle>
                  <div className="flex flex-col gap-1 p-5 pt-14">
                    {NAV.map((item) => {
                      const isActive = active === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={`${basePath}${item.href}`}
                          onClick={() => setMobileNavOpen(false)}
                          className={
                            isActive
                              ? "rounded-xl bg-amber-700/10 px-4 py-3 text-[15px] font-medium text-amber-800"
                              : "rounded-xl px-4 py-3 text-[15px] text-stone-600 hover:bg-stone-900/5 hover:text-stone-900"
                          }
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>

        <main className="flex flex-1 flex-col">{children}</main>

        <SiteFooter tenant={tenant} active={active} />

        <a
          href={waLink(dummyHotel.phoneNumber)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className={`fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-[bottom,transform] duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 sm:right-6 ${
            whatsAppRaised ? "bottom-24 sm:bottom-28" : "bottom-4 sm:bottom-6"
          }`}
        >
          <WhatsAppIcon className="size-7" />
        </a>
      </div>
    </WhatsAppOffsetContext.Provider>
  );
}

function SiteFooter({ tenant, active }: { tenant: string; active: SitePageId }) {
  const basePath = `/s/${tenant}`;
  return (
    <footer className="mt-auto bg-[#1c1712] px-4 py-14 text-stone-400 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <span className="font-[family-name:var(--font-site-display)] text-xl font-semibold text-white">
              {dummyHotel.name}
            </span>
            <p className="max-w-xs text-sm leading-relaxed">{dummyHotel.tagline}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-white">Explore</span>
            {NAV.filter((n) => n.id !== "table-booking").map((item) => (
              <Link
                key={item.id}
                href={`${basePath}${item.href}`}
                aria-current={active === item.id ? "page" : undefined}
                className="w-fit text-sm transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-white">Dining</span>
            <Link href={`${basePath}/menu`} className="w-fit text-sm transition-colors hover:text-white">
              Menu
            </Link>
            <Link
              href={`${basePath}/table-booking`}
              className="w-fit text-sm transition-colors hover:text-white"
            >
              Reserve a table
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-white">Get in touch</span>
            <span className="flex items-start gap-1.5 text-sm">
              <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
              {dummyHotel.address}
            </span>
            <a
              href={`tel:${dummyHotel.phoneNumber}`}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            >
              <PhoneIcon className="size-3.5 shrink-0" />
              {dummyHotel.phoneNumber}
            </a>
            <a
              href={`mailto:${dummyHotel.email}`}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            >
              <MailIcon className="size-3.5 shrink-0" />
              {dummyHotel.email}
            </a>
            <a
              href={waLink(dummyHotel.phoneNumber)}
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
            © {new Date().getFullYear()} {dummyHotel.name}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
