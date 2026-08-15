import "server-only";

import { cookies } from "next/headers";

import { API_BASE, SESSION_COOKIE } from "@/features/auth/constants";

import type { ApiResponse } from "./types/responses";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/**
 * Calls the Go API from a server component with the caller's session cookie
 * attached. Returns a result rather than throwing so a page can render a
 * failure state instead of failing the whole route.
 */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<Result<T>> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        ...(token ? { cookie: `${SESSION_COOKIE}=${token}` } : {}),
      },
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | ApiResponse<T>
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: body?.message ?? "Something went wrong",
      };
    }

    return { ok: true, data: body!.data };
  } catch {
    return { ok: false, status: 0, message: "Could not reach the server" };
  }
}
