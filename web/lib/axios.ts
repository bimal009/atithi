import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE, LOGIN_ROUTE, SESSION_COOKIE } from "@/features/auth/constants";

const isServer = typeof window === "undefined";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const NO_REFRESH_PATHS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/validate-otp",
  "/auth/resend-otp",
  "/auth/logout",
];

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

axiosInstance.interceptors.request.use(async (config) => {
  if (!isServer) return config;

  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    config.headers.set("Cookie", `${SESSION_COOKIE}=${token}`);
  }
  return config;
});

function extractSessionToken(setCookie: string[] | undefined): string | undefined {
  const header = setCookie?.find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));
  return header?.split(";", 1)[0]?.split("=", 2)[1];
}

let refreshPromise: Promise<string | undefined> | null = null;

function refreshOnce(): Promise<string | undefined> {
  refreshPromise ??= axiosInstance
    .post("/auth/refresh")
    .then((response) =>
      isServer
        ? extractSessionToken(response.headers["set-cookie"])
        : undefined,
    )
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
      const freshToken = await refreshOnce();
      if (isServer && freshToken) {
        config.headers.set("Cookie", `${SESSION_COOKIE}=${freshToken}`);
      }
      return await axiosInstance(config);
    } catch {
      if (!isServer) {
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
