import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { AFTER_LOGIN_REDIRECT } from "@/features/auth/constants";
import { requireUser } from "@/features/auth/server/session";

export const metadata: Metadata = {
  title: "Finish your profile · Atithi",
};

export default async function OnboardingPage() {
  const user = await requireUser();

  if (user.isOnboarded) redirect(AFTER_LOGIN_REDIRECT);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        <OnboardingForm user={user} />
      </div>
    </div>
  );
}
