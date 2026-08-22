import type { Metadata } from "next";

import { ContactPageContent2 } from "@/features/site/v2/components/contact-page-content-2";
import { SiteShell2 } from "@/features/site/v2/components/site-shell-2";
import { dummyHotel } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Contact — ${dummyHotel.name}` };
}

export default async function ContactPage2({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  return (
    <SiteShell2 tenant={tenant} active="contact">
      <ContactPageContent2 />
    </SiteShell2>
  );
}
