"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AvatarUpload } from "@/features/upload/components/avatar-upload";

import { useCompleteOnboarding } from "../client/useAuth";
import { AFTER_LOGIN_REDIRECT } from "../constants";
import { OnboardingValues, onboardingSchema } from "../schema";
import type { AuthUser } from "../types";

const PLACEHOLDER_EMAIL_DOMAIN = "@atithi.com";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function OnboardingForm({ user }: { user: AuthUser }) {
  const router = useRouter();
  const onboard = useCompleteOnboarding();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      // Signup seeds these with the phone number and a placeholder address.
      name: user.name === user.phoneNumber ? "" : user.name,
      email: user.email.endsWith(PLACEHOLDER_EMAIL_DOMAIN) ? "" : user.email,
      image: user.image ?? "",
    },
  });

  const name = watch("name");
  const image = watch("image");
  const initials = initialsOf(name);

  const onSubmit = handleSubmit(async (values) => {
    await onboard.mutateAsync({
      name: values.name,
      email: values.email,
      image: values.image ? values.image : undefined,
    });

    toast.success("Profile saved");
    router.replace(AFTER_LOGIN_REDIRECT);
    router.refresh();
  });

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl shadow-foreground/5">
      <CardContent className="px-7 py-9 sm:px-10 sm:py-11">
        <form className="w-full" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-7">
            <div className="flex flex-col items-center gap-2.5 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Finish your profile
              </h1>
              <p className="text-balance text-[15px] leading-relaxed text-muted-foreground">
                We only know your number so far. Tell us who you are so your
                team can recognise you.
              </p>
            </div>

            <AvatarUpload
              value={image || undefined}
              onChange={(url) =>
                setValue("image", url ?? "", { shouldValidate: true })
              }
              fallback={initials || undefined}
              disabled={onboard.isPending}
            />

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                autoFocus
                placeholder="Bimal Pandey"
                aria-invalid={!!errors.name}
                className="h-12 rounded-xl text-base"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@hotel.com.np"
                aria-invalid={!!errors.email}
                className="h-12 rounded-xl text-base"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
              <FieldDescription>
                Used for receipts and password-free sign in on other devices.
              </FieldDescription>
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-xl text-[15px] font-medium"
                disabled={onboard.isPending}
                data-icon={onboard.isPending ? "inline-start" : undefined}
              >
                {onboard.isPending && <Spinner />}
                {onboard.isPending ? "Saving" : "Continue"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
