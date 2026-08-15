import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { AuthSession, AuthUser, OnboardingInput, Session } from "../types";

export const login = async (
  phoneNumber: string,
): Promise<ApiResponse<AuthUser>> => {
  const { data } = await axiosInstance.post<ApiResponse<AuthUser>>(
    "/auth/login",
    { phoneNumber },
  );
  return data;
};

export const validateOtp = async (
  phoneNumber: string,
  otp: string,
): Promise<ApiResponse<AuthSession>> => {
  const { data } = await axiosInstance.post<ApiResponse<AuthSession>>(
    "/auth/validate-otp",
    { phoneNumber, otp },
  );
  return data;
};

export const resendOtp = async (
  phoneNumber: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    "/auth/resend-otp",
    { phoneNumber },
  );
  return data;
};

export const me = async (): Promise<ApiResponse<AuthUser>> => {
  const { data } = await axiosInstance.get<ApiResponse<AuthUser>>("/auth/me");
  return data;
};

/** The API swaps the HttpOnly cookie in the response; nothing to store here. */
export const refreshSession = async (): Promise<ApiResponse<Session>> => {
  const { data } = await axiosInstance.post<ApiResponse<Session>>(
    "/auth/refresh",
  );
  return data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.post<ApiResponse<null>>("/auth/logout");
  return data;
};

export const completeOnboarding = async (
  input: OnboardingInput,
): Promise<ApiResponse<AuthUser>> => {
  const { data } = await axiosInstance.patch<ApiResponse<AuthUser>>(
    "/auth/onboarding",
    input,
  );
  return data;
};
