import { API_BASE } from "@/features/auth/constants";
import type { Hotel } from "@/features/hotel/types";
import type { Cabin } from "@/features/tenant/cabin/types";
import type { GalleryImage } from "@/features/tenant/gallery/types";
import type { SiteContent } from "@/features/tenant/hotelWebsite/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";
import type { DiningTable } from "@/features/tenant/table/types";

export type PublicSiteResponse = {
  hotel: Hotel;
  website: {
    template: string;
    theme: string;
    fontPairing: string;
    content: SiteContent;
  };
  roomTypes: RoomType[];
  cabins: Cabin[];
  tables: DiningTable[];
  menuItems: MenuItem[];
  galleryImages: GalleryImage[];
  currency: string;
  mapUrl?: string;
};

export async function getPublicSite(slug: string): Promise<PublicSiteResponse | null> {
  const res = await fetch(`${API_BASE}/public/hotels/${slug}/site`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { data: PublicSiteResponse };
  return json.data;
}
