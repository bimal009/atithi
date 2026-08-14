"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { login, resendOtp, validateOtp } from "../api/auth";
import { AuthUser } from "../types";

export const authKeys = {
  user: ["auth", "user"] as const,
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
