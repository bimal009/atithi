"use client";

import * as React from "react";
import Link from "next/link";
import { BellIcon, MailIcon, MapPinIcon, MenuIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { dummyHotel } from "../../lib/dummy-data";
import { waLink, WhatsAppIcon } from "../../components/whatsapp-icon";
import { site2FontClass } from "../lib/fonts";

export type Site2PageId = "home" | "rooms" | "cabins" | "menu" | "table-booking" | "contact";

const NAV: { id: Site2PageId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "" },
  { id: "rooms", label: "Rooms", href: "/rooms" },
  { id: "cabins", label: "Cabins", href: "/cabins" },
  { id: "menu", label: "Restaurant", href: "/menu" },
  { id: "table-booking", label: "Table booking", href: "/table-booking" },
  { id: "contact", label: "Contact", href: "/contact" },
];

const WhatsAppOffsetContext = React.createContext<(raised: boolean) => void>(() => {});

export function useWhatsAppOffset2(raised: boolean) {
  const setRaised = React.useContext(WhatsAppOffsetContext);
  React.useEffect(() => {
    setRaised(raised);
    return () => setRaised(false);
  }, [raised, setRaised]);
}

export function SiteShell2({
  tenant,
  active,
  children,
}: {
  tenant: string;
  active: Site2PageId;
  children: React.ReactNode;
}) {
  const basePath = `/s/${tenant}/2`;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [whatsAppRaised, setWhatsAppRaised] = React.useState(false);

  return (
    <WhatsAppOffsetContext.Provider value={setWhatsAppRaised}>
      <div
        className={`${site2FontClass} flex min-h-screen flex-col bg-[#FAFAF8] text-[#17181A] antialiased`}
        style={{ fontFamily: "var(--font-site2-body)" }}
      >
        <nav className="sticky top-0 z-30 border-b border-[#17181A]/10 bg-[#FAFAF8]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
            <Link
              href={basePath}
              className="shrink-0 font-[family-name:var(--font-site2-display)] text-[17px] font-semibold tracking-tight"
            >
              {dummyHotel.name}
            </Link>

            <div className="hidden items-center gap-9 md:flex">
              {NAV.map((item) => {
                const isActive = active === item.id;
                return (
                  <Link
                    key={item.id}
                    href={`${basePath}${item.href}`}
                    className="group relative py-1 text-[13px] font-medium tracking-wide text-[#17181A]/60 transition-colors hover:text-[#17181A]"
                  >
                    <span className={isActive ? "text-[#17181A]" : ""}>{item.label}</span>
                    <span
                      className={
                        isActive
                          ? "absolute inset-x-0 -bottom-[17px] h-px bg-[#4B5D46]"
                          : "absolute inset-x-0 -bottom-[17px] h-px scale-x-0 bg-[#17181A]/30 transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none"
                      }
                    />
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="relative rounded-sm text-[#17181A]/70 hover:bg-[#17181A]/5 hover:text-[#17181A]"
                      aria-label="Notifications"
                    />
                  }
                >
                  <BellIcon className="size-[18px]" strokeWidth={1.75} />
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#4B5D46]" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 rounded-sm">
                  <span className="text-sm font-medium">Notifications</span>
                  <p className="mt-1 text-sm text-[#17181A]/55">
                    You&apos;ll see booking and order updates here once you reserve or place an order.
                  </p>
                </PopoverContent>
              </Popover>

              <Button
                size="sm"
                className="hidden rounded-sm bg-[#17181A] px-4 text-white hover:bg-[#17181A]/85 sm:inline-flex"
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
                      className="rounded-sm text-[#17181A]/70 hover:bg-[#17181A]/5 hover:text-[#17181A] md:hidden"
                      aria-label="Open menu"
                    >
                      <MenuIcon strokeWidth={1.75} />
                    </Button>
                  }
                />
                <SheetContent side="right" className="w-72 bg-[#FAFAF8] p-0 text-[#17181A]">
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
                              ? "rounded-sm bg-[#4B5D46]/10 px-4 py-3 text-[15px] font-medium text-[#4B5D46]"
                              : "rounded-sm px-4 py-3 text-[15px] font-medium text-[#17181A]/65 hover:bg-[#17181A]/5 hover:text-[#17181A]"
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

        <Site2Footer tenant={tenant} active={active} />

        <a
          href={waLink(dummyHotel.phoneNumber)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className={`fixed right-4 z-40 flex size-13 items-center justify-center rounded-full bg-[#17181A] text-white shadow-lg shadow-black/15 transition-[bottom,transform] duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 sm:right-6 ${
            whatsAppRaised ? "bottom-24 sm:bottom-28" : "bottom-4 sm:bottom-6"
          }`}
        >
          <WhatsAppIcon className="size-6" />
        </a>
      </div>
    </WhatsAppOffsetContext.Provider>
  );
}

function Site2Footer({ tenant, active }: { tenant: string; active: Site2PageId }) {
  const basePath = `/s/${tenant}/2`;
  return (
    <footer className="mt-auto border-t border-[#17181A]/10 bg-[#17181A] px-4 py-16 text-white/50 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <span className="font-[family-name:var(--font-site2-display)] text-lg font-semibold text-white">
              {dummyHotel.name}
            </span>
            <p className="max-w-xs text-sm leading-relaxed">{dummyHotel.tagline}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium tracking-[0.12em] text-white/40 uppercase">Explore</span>
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
            <span className="text-xs font-medium tracking-[0.12em] text-white/40 uppercase">Dining</span>
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
            <span className="text-xs font-medium tracking-[0.12em] text-white/40 uppercase">Get in touch</span>
            <span className="flex items-start gap-1.5 text-sm">
              <MapPinIcon className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
              {dummyHotel.address}
            </span>
            <a
              href={`tel:${dummyHotel.phoneNumber}`}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            >
              <PhoneIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
              {dummyHotel.phoneNumber}
            </a>
            <a
              href={`mailto:${dummyHotel.email}`}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            >
              <MailIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
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
