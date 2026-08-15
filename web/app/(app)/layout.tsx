import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/features/auth/components/user-menu";
import { requireOnboardedUser } from "@/features/auth/server/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/hotels"
            className="rounded-sm transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Logo />
          </Link>
          <UserMenu user={user} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
