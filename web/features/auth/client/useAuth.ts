"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { login, logout, me, refreshSession, register, updateProfile } from "../api/auth";
import { AFTER_LOGIN_REDIRECT, LOGIN_ROUTE } from "../constants";
import { AuthUser, UpdateProfileInput } from "../types";

export const authKeys = {
  user: ["auth", "user"] as const,
};

export const useMe = (initialData?: AuthUser) => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => (await me()).data,
    initialData,
    staleTime: 1000 * 60,
  });
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      register(input),
    onSuccess: () => {
      toast.success("Account created. Please log in.");
      router.push(LOGIN_ROUTE);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create your account"));
    },
    onSettled: () => queryClient,
  });
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) => login(input),
    onSuccess: (response) => {
      queryClient.setQueryData<AuthUser>(authKeys.user, response.data.user);
      router.push(AFTER_LOGIN_REDIRECT);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not log you in"));
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
      router.replace(LOGIN_ROUTE);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not log you out"));
    },
  });
};

export const useRefreshSession = () => {
  return useMutation({
    mutationFn: () => refreshSession(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (response) => {
      queryClient.setQueryData<AuthUser>(authKeys.user, response.data);
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update profile"));
    },
  });
};

export const useValidateOtp = () => {
  return useMutation({
    mutationFn: async (_input: { phoneNumber: string; otp: string }) => {
      throw new Error("OTP login is no longer supported");
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async (_phoneNumber: string) => {
      throw new Error("OTP login is no longer supported");
    },
  });
};