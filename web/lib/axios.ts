import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE, LOGIN_ROUTE } from "@/features/auth/constants";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

/** A 401 from these is the answer, not a stale token. */
const NO_REFRESH_PATHS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/validate-otp",
  "/auth/resend-otp",
  "/auth/logout",
];

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * One shared refresh for all callers. Refreshing rotates the token, so five
 * concurrent refreshes would rotate it out from under each other and log the
 * user out.
 */
let refreshPromise: Promise<void> | null = null;

function refreshOnce(): Promise<void> {
  refreshPromise ??= axiosInstance
    .post("/auth/refresh")
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? "";

    const shouldRefresh =
      status === 401 &&
      config &&
      !config._retried &&
      !NO_REFRESH_PATHS.some((path) => url.startsWith(path));

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      await refreshOnce();
      return await axiosInstance(config);
    } catch {
      // Full navigation, not a router push — it clears client caches that
      // would otherwise keep holding the previous user's data.
      if (typeof window !== "undefined") {
        window.location.href = LOGIN_ROUTE;
      }
      return Promise.reject(error);
    }
  },
);

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
