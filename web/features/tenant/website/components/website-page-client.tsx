"use client";

import * as React from "react";
import {
  GlobeIcon,
  MonitorIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  SlidersHorizontalIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useHotelBySlugQuery } from "@/features/hotel/client/useHotels";
import { useCabinsQuery } from "@/features/tenant/cabin/client/useCabins";
import { useGalleryImagesQuery } from "@/features/tenant/gallery/client/useGallery";
import { useHotelSettingsQuery } from "@/features/tenant/hotelSettings/client/useHotelSettings";
import {
  useHotelWebsiteQuery,
  useUpdateHotelWebsite,
} from "@/features/tenant/hotelWebsite/client/useHotelWebsite";
import { useMenuItemsQuery } from "@/features/tenant/menuItem/client/useMenuItems";
import { useRoomTypesQuery } from "@/features/tenant/roomType/client/useRoomTypes";
import { useTablesQuery } from "@/features/tenant/table/client/useTables";

import { TEMPLATE_MODE, TEMPLATES } from "../templates/registry";
import { SiteThemeProvider } from "../templates/site-theme-provider";
import { defaultSiteContent, type SiteContent, type TemplateId } from "../types";
import { FontPicker } from "./font-picker";
import { GalleryManager } from "./gallery-manager";
import { SectionToggles } from "./section-toggles";
import { TemplatePicker } from "./template-picker";
import { ThemePicker } from "./theme-picker";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: MonitorIcon, width: "100%" },
  { id: "tablet", label: "Tablet", icon: TabletIcon, width: "48rem" },
  { id: "mobile", label: "Mobile", icon: SmartphoneIcon, width: "24rem" },
] as const;

function InspectorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </span>
      {children}
    </div>
  );
}

function WebsiteEditorSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-[75vh] w-full rounded-2xl" />
    </div>
  );
}

export function WebsitePageClient({ tenant }: { tenant: string }) {
  const hotelQuery = useHotelBySlugQuery(tenant);
  const settingsQuery = useHotelSettingsQuery(tenant);
  const websiteQuery = useHotelWebsiteQuery(tenant);
  const roomTypesQuery = useRoomTypesQuery(tenant, { limit: 12 });
  const cabinsQuery = useCabinsQuery(tenant, { limit: 12 });
  const tablesQuery = useTablesQuery(tenant, { limit: 12 });
  const menuItemsQuery = useMenuItemsQuery(tenant, { limit: 100 });
  const galleryQuery = useGalleryImagesQuery(tenant);
  const updateWebsite = useUpdateHotelWebsite(tenant);

  const hotel = hotelQuery.data;

  const [template, setTemplate] = React.useState<TemplateId>("stonehouse");
  const [theme, setTheme] = React.useState("amber");
  const [fontPairing, setFontPairing] = React.useState("fraunces-public");
  const [content, setContent] = React.useState<SiteContent | null>(null);
  const [device, setDevice] = React.useState<(typeof DEVICES)[number]["id"]>("desktop");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const seeded = React.useRef(false);

  React.useEffect(() => {
    if (seeded.current || !hotel || !websiteQuery.data) return;
    seeded.current = true;

    setTemplate((websiteQuery.data.template as TemplateId) || "stonehouse");
    setTheme(websiteQuery.data.theme || "amber");
    setFontPairing(websiteQuery.data.fontPairing || "fraunces-public");

    const saved = websiteQuery.data.content;
    const hasSavedContent = saved && Object.values(saved).some((v) => v);
    setContent(hasSavedContent ? { ...defaultSiteContent(hotel), ...saved } : defaultSiteContent(hotel));
  }, [hotel, websiteQuery.data]);

  if (hotelQuery.isPending || !hotel || websiteQuery.isPending || !content) {
    return <WebsiteEditorSkeleton />;
  }

  const currency = settingsQuery.data?.currency ?? "NPR";
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const activeTemplate = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];
  const TemplateComponent = activeTemplate.Component;
  const activeDevice = DEVICES.find((d) => d.id === device) ?? DEVICES[0];

  const siteData = {
    hotel,
    roomTypes: roomTypesQuery.data?.roomTypes ?? [],
    cabins: cabinsQuery.data?.cabins ?? [],
    tables: tablesQuery.data?.tables ?? [],
    menuItems: menuItemsQuery.data?.menuItems ?? [],
    galleryImages: (galleryQuery.data ?? []).map((img) => img.url),
    formatMoney,
    content,
  };

  function patchContent(patch: Partial<SiteContent>) {
    setContent((c) => (c ? { ...c, ...patch } : c));
  }

  const inspector = (
    <>
      <InspectorSection title="Template">
        <TemplatePicker value={template} onChange={setTemplate} />
      </InspectorSection>
      <Separator />
      <InspectorSection title="Color theme">
        <ThemePicker value={theme} onChange={setTheme} />
      </InspectorSection>
      <Separator />
      <InspectorSection title="Typography">
        <FontPicker value={fontPairing} onChange={setFontPairing} />
      </InspectorSection>
      <Separator />
      <InspectorSection title="Sections">
        <SectionToggles content={content} onChange={patchContent} />
      </InspectorSection>
      <Separator />
      <InspectorSection title="Gallery">
        <GalleryManager tenant={tenant} />
      </InspectorSection>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight">Website</h1>
        <p className="text-sm text-muted-foreground">
          Click any text or photo on the preview to edit it directly. Pick a template, theme and
          font pairing on the right.
        </p>
      </div>

      <div className="dark relative flex h-[82vh] min-h-[640px] flex-col overflow-hidden rounded-2xl bg-background text-foreground ring-1 ring-border">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <GlobeIcon className="size-4 shrink-0 text-primary" />
            <span className="truncate text-sm font-medium">{hotel.name}</span>
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              / {activeTemplate.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => updateWebsite.mutate({ template, theme, fontPairing, content })}
              disabled={updateWebsite.isPending}
              data-icon={updateWebsite.isPending ? "inline-start" : undefined}
            >
              {updateWebsite.isPending && <Spinner />}
              {updateWebsite.isPending ? "Saving" : "Save"}
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden md:inline-flex"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Close inspector" : "Open inspector"}
              title={sidebarOpen ? "Close inspector" : "Open inspector"}
            >
              {sidebarOpen ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
            </Button>

            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    aria-label="Customize"
                  >
                    <SlidersHorizontalIcon />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
                <SheetTitle className="sr-only">Customize website</SheetTitle>
                <div className="flex flex-col gap-5 overflow-y-auto p-4">{inspector}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <div className="flex flex-1 justify-center overflow-auto bg-muted/40 p-4 sm:p-10">
            <div style={{ width: activeDevice.width, maxWidth: "100%" }} className="shrink-0">
              <span className="mb-2 block text-xs text-muted-foreground">
                {activeTemplate.name} · {activeDevice.label}
              </span>
              <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-border">
                <SiteThemeProvider
                  themeId={theme}
                  mode={TEMPLATE_MODE[template] ?? "light"}
                  fontPairingId={fontPairing}
                >
                  <TemplateComponent
                    data={siteData}
                    themeId={theme}
                    editable
                    onContentChange={patchContent}
                  />
                </SiteThemeProvider>
              </div>
            </div>
          </div>

          {/* Inspector (desktop) */}
          {sidebarOpen && (
            <div className="hidden w-80 shrink-0 flex-col gap-5 overflow-y-auto border-l border-border bg-background p-4 md:flex">
              {inspector}
            </div>
          )}
        </div>

        {/* Floating device toolbar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-popover px-1.5 py-1.5 ring-1 ring-border shadow-xl">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                title={d.label}
                aria-label={d.label}
                onClick={() => setDevice(d.id)}
                className={cn(
                  "flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors",
                  device === d.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <d.icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
