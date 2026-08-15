import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  API_BASE,
  LOGIN_ROUTE,
  ONBOARDING_ROUTE,
  SESSION_COOKIE,
} from "../constants";
import type { AuthUser } from "../types";

/**
 * cache() dedupes this per request, so a layout and its pages asking for the
 * user cost one call to the API rather than one each.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
    cache: "no-store",
  });

  // Only a rejected session means logged out. Anything else is the API
  // failing, and must not masquerade as a logout — that would bounce a
  // signed-in user to /login on a transient blip.
  if (response.status === 401 || response.status === 403) return null;

  if (!response.ok) {
    throw new Error(`GET /auth/me failed with ${response.status}`);
  }

  const body = (await response.json()) as { data: AuthUser };
  return body.data ?? null;
});

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_ROUTE);
  return user;
}

export async function requireOnboardedUser(): Promise<AuthUser> {
  const user = await requireUser();
  if (!user.isOnboarded) redirect(ONBOARDING_ROUTE);
  return user;
}
