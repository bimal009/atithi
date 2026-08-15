"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  completeOnboarding,
  login,
  logout,
  me,
  refreshSession,
  resendOtp,
  validateOtp,
} from "../api/auth";
import { LOGIN_ROUTE } from "../constants";
import { AuthUser, OnboardingInput } from "../types";

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

export const useLogin = () => {
  return useMutation({
    mutationFn: (phoneNumber: string) => login(phoneNumber),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not send the OTP"));
    },
  });
};

export const useValidateOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) =>
      validateOtp(phoneNumber, otp),
    onSuccess: (response) => {
      queryClient.setQueryData<AuthUser>(authKeys.user, response.data.user);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not verify the code"));
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (phoneNumber: string) => resendOtp(phoneNumber),
    onSuccess: () => {
      toast.success("We sent you a new code");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not resend the OTP"));
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OnboardingInput) => completeOnboarding(input),
    onSuccess: (response) => {
      queryClient.setQueryData<AuthUser>(authKeys.user, response.data);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not save your profile"));
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // The next user on this browser must not see the last one's data.
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
