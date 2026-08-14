"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";

import { NepalFlag } from "@/components/shared/nepal-flag";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useLogin } from "../client/useAuth";
import {
  LoginValues,
  NEPAL_DIAL_CODE,
  loginSchema,
  normalizePhoneNumber,
} from "../schema";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phoneNumber: "", acceptedTerms: false },
  });

  const phoneField = register("phoneNumber");

  const onSubmit = handleSubmit(async ({ phoneNumber }) => {
    const next = `/verify-otp?phone=${encodeURIComponent(phoneNumber)}`;

    try {
      await login.mutateAsync(phoneNumber);
      toast.success(`Code sent to ${NEPAL_DIAL_CODE} ${phoneNumber}`);
      router.push(next);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        router.push(next);
      }
    }
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl shadow-foreground/5">
        <CardContent className="px-7 py-9 sm:px-10 sm:py-11">
          <form className="w-full" onSubmit={onSubmit} noValidate>
            <FieldGroup className="gap-7">
              <div className="flex flex-col items-center gap-2.5 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Log in to Atithi
                </h1>
                <p className="text-balance text-[15px] leading-relaxed text-muted-foreground">
                  Enter your mobile number to get a verification code
                </p>
              </div>
              <Field data-invalid={!!errors.phoneNumber}>
                <FieldLabel htmlFor="phoneNumber">Mobile number</FieldLabel>
                <InputGroup className="h-12 rounded-xl">
                  <InputGroupAddon className="mr-1 border-r border-input py-2.5 pr-3 pl-3.5">
                    <span className="flex items-center gap-2">
                      <NepalFlag className="h-5 w-auto" />
                      <span className="font-medium text-foreground">
                        {NEPAL_DIAL_CODE}
                      </span>
                    </span>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    autoFocus
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    aria-invalid={!!errors.phoneNumber}
                    className="h-12 text-base tracking-[0.12em] placeholder:tracking-[0.08em]"
                    {...phoneField}
                    onChange={(event) => {
                      event.target.value = normalizePhoneNumber(
                        event.target.value,
                      );
                      phoneField.onChange(event);
                    }}
                  />
                </InputGroup>
                <FieldError errors={[errors.phoneNumber]} />
                <FieldDescription>
                  10 digits starting with 98 or 97.
                </FieldDescription>
              </Field>
              <Field data-invalid={!!errors.acceptedTerms}>
                <Field orientation="horizontal" className="items-start gap-2.5">
                  <Controller
                    control={control}
                    name="acceptedTerms"
                    render={({ field }) => (
                      <Checkbox
                        id="acceptedTerms"
                        className="mt-0.5"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        aria-invalid={!!errors.acceptedTerms}
                      />
                    )}
                  />
                  <FieldLabel
                    htmlFor="acceptedTerms"
                    className="block w-full cursor-pointer gap-0 text-sm font-normal leading-snug text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary"
                  >
                    I agree to the <a href="#">Terms of Service</a> and{" "}
                    <a href="#">Privacy Policy</a>
                  </FieldLabel>
                </Field>
                <FieldError errors={[errors.acceptedTerms]} />
              </Field>
              <Field>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 rounded-xl text-[15px] font-medium"
                  disabled={login.isPending}
                  data-icon={login.isPending ? "inline-start" : undefined}
                >
                  {login.isPending && <Spinner />}
                  {login.isPending ? "Sending code" : "Continue"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
