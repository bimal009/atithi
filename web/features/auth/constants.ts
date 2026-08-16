export const SESSION_COOKIE =
  process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "_hiatithi_secure_token";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const API_BASE = `${API_URL}/api/v1`;

export const AFTER_LOGIN_REDIRECT = "/hotels";
export const ONBOARDING_ROUTE = "/onboarding";
export const LOGIN_ROUTE = "/login";
