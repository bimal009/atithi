"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { addMember } from "../api/member";
import type { AddMemberInput } from "../types";

export const useAddMember = (tenant: string) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: AddMemberInput) => addMember(tenant, input),
    onSuccess: (response) => {
      toast.success(`${response.data.userName} added`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the staff member"));
    },
  });
};
