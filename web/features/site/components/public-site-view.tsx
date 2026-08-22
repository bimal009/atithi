"use client";

import * as React from "react";

import { TEMPLATES, TEMPLATE_MODE } from "@/features/tenant/website/templates/registry";
import { SiteThemeProvider } from "@/features/tenant/website/templates/site-theme-provider";
import { defaultSiteContent, type Page } from "@/features/tenant/website/types";

import type { PublicSiteResponse } from "../api/public-site";

export function PublicSiteView({
  site,
  page,
  detailId,
}: {
  site: PublicSiteResponse;
  page: Page;
  detailId?: string;
}) {
  const { hotel, website, roomTypes, cabins, tables, menuItems, galleryImages, currency, mapUrl } = site;

  const content = React.useMemo(() => {
    const hasSavedContent = website.content && Object.values(website.content).some((v) => v);
    return hasSavedContent
      ? { ...defaultSiteContent(hotel), ...website.content }
      : defaultSiteContent(hotel);
  }, [hotel, website.content]);

  const formatMoney = React.useCallback(
    (amount: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount),
    [currency],
  );

  const data = {
    hotel,
    roomTypes,
    cabins,
    tables,
    menuItems,
    galleryImages: galleryImages.map((img) => ({ url: img.url, section: img.section })),
    mapUrl,
    formatMoney,
    content,
  };

  const template = TEMPLATES.find((t) => t.id === website.template) ?? TEMPLATES[0];
  const TemplateComponent = template.Component;

  return (
    <SiteThemeProvider
      themeId={website.theme}
      mode={TEMPLATE_MODE[template.id] ?? "light"}
      fontPairingId={website.fontPairing}
      className="h-screen overflow-y-auto scrollbar-none"
    >
      <TemplateComponent
        data={data}
        themeId={website.theme}
        page={page}
        basePath={`/s/${hotel.slug}`}
        detailId={detailId}
      />
    </SiteThemeProvider>
  );
}
