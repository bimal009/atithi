"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";

import { useResendOtp, useValidateOtp } from "../client/useAuth";
import { NEPAL_DIAL_CODE, OTP_LENGTH, OtpValues, otpSchema } from "../schema";

const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({
  phoneNumber,
  className,
  ...props
}: React.ComponentProps<"div"> & { phoneNumber: string }) {
  const router = useRouter();
  const validate = useValidateOtp();
  const resend = useResendOtp();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const submit = handleSubmit(async ({ otp }) => {
    try {
      await validate.mutateAsync({ phoneNumber, otp });
      toast.success("You're signed in");
      router.replace("/");
    } catch (error) {
      setValue("otp", "");
      setError("otp", {
        message: getErrorMessage(error, "That code didn't work"),
      });
    }
  });

  const onResend = useCallback(async () => {
    try {
      await resend.mutateAsync(phoneNumber);
    } finally {
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  }, [phoneNumber, resend]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
  
      <Card className="overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl shadow-foreground/5">
        <CardContent className="px-7 py-9 sm:px-10 sm:py-11">
          <form className="w-full" onSubmit={submit} noValidate>
            <FieldGroup className="gap-7">
              <div className="flex flex-col items-center gap-2.5 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Verify your number
                </h1>
                <p className="text-balance text-[15px] leading-relaxed text-muted-foreground">
                  We sent a {OTP_LENGTH} digit code to{" "}
                  <span className="font-medium text-foreground">
                    {NEPAL_DIAL_CODE} {phoneNumber}
                  </span>
                </p>
              </div>
              <Field
                className="items-center"
                data-invalid={!!errors.otp}
              >
                <FieldLabel htmlFor="otp" className="sr-only">
                  Verification code
                </FieldLabel>
                <Controller
                  control={control}
                  name="otp"
                  render={({ field }) => (
                    <InputOTP
                      id="otp"
                      maxLength={OTP_LENGTH}
                      autoFocus
                      disabled={validate.isPending}
                      containerClassName="justify-center"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onComplete={() => {
                        setTimeout(submit, 0);
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: OTP_LENGTH }, (_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            aria-invalid={!!errors.otp}
                            className="size-12 text-lg first:rounded-l-xl last:rounded-r-xl"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                <FieldError className="text-center" errors={[errors.otp]} />
              </Field>
              <Field>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 rounded-xl text-[15px] font-medium"
                  disabled={validate.isPending}
                  data-icon={validate.isPending ? "inline-start" : undefined}
                >
                  {validate.isPending && <Spinner />}
                  {validate.isPending ? "Verifying" : "Verify and continue"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                {cooldown > 0 ? (
                  <>Didn&apos;t get it? Resend in {cooldown}s</>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={onResend}
                    disabled={resend.isPending}
                  >
                    {resend.isPending ? "Sending" : "Resend code"}
                  </Button>
                )}
              </FieldDescription>
              <FieldDescription className="text-center">
                <Link href="/login">Use a different number</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        The code expires in 5 minutes.
      </FieldDescription>
    </div>
  );
}
