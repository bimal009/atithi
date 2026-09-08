import type { Metadata } from "next";
import { MessageSquareIcon } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Messages · Atithi",
};

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Unified guest communication across SMS, WhatsApp, and booking channels."
      />
      <ComingSoon
        icon={MessageSquareIcon}
        title="Messages is coming soon"
        description="We're building an integrated inbox so you can chat with guests and handle inquiries directly from Atithi."
      />
    </div>
  );
}
