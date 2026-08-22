import type { Metadata } from "next";

import { ContactPageContent } from "@/features/site/components/contact-page-content";
import { SiteShell } from "@/features/site/components/site-shell";
import { dummyHotel } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Contact — ${dummyHotel.name}` };
}

export default async function ContactPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  return (
    <SiteShell tenant={tenant} active="contact">
      <ContactPageContent />
    </SiteShell>
  );
}
