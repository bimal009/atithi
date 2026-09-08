import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { AuthSession, AuthUser, UpdateProfileInput } from "../types";

export const register = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse<AuthUser>> => {
  const { data } = await axiosInstance.post<ApiResponse<AuthUser>>(
    "/auth/register",
    input,
  );
  return data;
};

export const login = async (input: {
  email: string;
  password: string;
}): Promise<ApiResponse<AuthSession>> => {
  const { data } = await axiosInstance.post<ApiResponse<AuthSession>>(
    "/auth/login",
    input,
  );
  return data;
};

export const me = async (): Promise<ApiResponse<AuthUser>> => {
  const { data } = await axiosInstance.get<ApiResponse<AuthUser>>("/auth/me");
  return data;
};

export const updateProfile = async (
  input: UpdateProfileInput,
): Promise<ApiResponse<AuthUser>> => {
  const { data } = await axiosInstance.patch<ApiResponse<AuthUser>>(
    "/auth/profile",
    input,
  );
  return data;
};

/** The API swaps the HttpOnly cookie in the response; nothing to store here. */
export const refreshSession = async (): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.post<ApiResponse<null>>("/auth/refresh");
  return data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.post<ApiResponse<null>>("/auth/logout");
  return data;
};