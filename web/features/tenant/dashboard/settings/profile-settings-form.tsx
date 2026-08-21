"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCompleteOnboarding, useMe } from "@/features/auth/client/useAuth";
import { NEPAL_DIAL_CODE } from "@/features/auth/schema";
import { OnboardingValues, onboardingSchema } from "@/features/auth/schema";
import type { AuthUser } from "@/features/auth/types";
import { AvatarUpload } from "@/features/upload/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

import { SettingsRow } from "./settings-row";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function ProfileForm({ user }: { user: AuthUser }) {
  const onboard = useCompleteOnboarding();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image ?? "",
    },
  });

  const name = watch("name");
  const image = watch("image");

  const onSubmit = handleSubmit(async (values) => {
    await onboard.mutateAsync({
      name: values.name,
      email: values.email,
      image: values.image ? values.image : undefined,
    });
    toast.success("Profile updated");
  });

  return (
    <Card>
      <CardContent>
        <form id="profile-settings-form" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-0">
            <SettingsRow
              label="Profile photo"
              description="Shown across the dashboard and to your team."
            >
              <AvatarUpload
                value={image || undefined}
                onChange={(url) => setValue("image", url ?? "", { shouldValidate: true })}
                fallback={initialsOf(name) || undefined}
                disabled={onboard.isPending}
                className="items-start"
              />
            </SettingsRow>

            <SettingsRow
              label="Full name"
              description="Your name as your team will see it."
            >
              <Field data-invalid={!!errors.name}>
                <Input
                  id="profile-name"
                  autoComplete="name"
                  placeholder="Bimal Pandey"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>
            </SettingsRow>

            <SettingsRow
              label="Email"
              description="Used for receipts and password-free sign in."
            >
              <Field data-invalid={!!errors.email}>
                <Input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@hotel.com.np"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
            </SettingsRow>

            <SettingsRow
              label="Phone number"
              description="Used to sign in. Contact support to change it."
            >
              <Field>
                <Input
                  value={`${NEPAL_DIAL_CODE} ${user.phoneNumber}`}
                  disabled
                  readOnly
                />
              </Field>
            </SettingsRow>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="profile-settings-form"
          disabled={onboard.isPending || !isDirty}
          data-icon={onboard.isPending ? "inline-start" : undefined}
        >
          {onboard.isPending && <Spinner />}
          {onboard.isPending ? "Saving" : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProfileSettingsSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 flex-1 max-w-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ProfileSettingsForm() {
  const { data: user, isPending } = useMe();

  if (isPending || !user) {
    return <ProfileSettingsSkeleton />;
  }

  return <ProfileForm user={user} />;
}
