"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BillingSettingsForm } from "./billing-settings-form";
import { HotelSettingsForm } from "./hotel-settings-form";
import { ProfileSettingsForm } from "./profile-settings-form";

const tabParser = parseAsStringLiteral(["profile", "hotel"] as const)
  .withDefault("profile")
  .withOptions({ history: "replace" });

export function SettingsPageClient({ tenant }: { tenant: string }) {
  const [tab, setTab] = useQueryState("tab", tabParser);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your profile and hotel details." />

      <Tabs value={tab} onValueChange={(value) => setTab(value as "profile" | "hotel")}>
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="hotel">Hotel settings</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {tab === "profile" ? (
            <ProfileSettingsForm />
          ) : (
            <div className="flex flex-col gap-6">
              <HotelSettingsForm tenant={tenant} />
              <BillingSettingsForm tenant={tenant} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
