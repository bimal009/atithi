import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { AuthSession, AuthUser } from "../types";

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
