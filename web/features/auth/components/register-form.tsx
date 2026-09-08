"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { LOGIN_ROUTE } from "../constants";
import { useRegister } from "../client/useAuth";
import { registerSchema, RegisterValues } from "../schema";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const registerUser = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    registerUser.mutate(values);
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl shadow-foreground/5">
        <CardContent className="px-7 py-9 sm:px-10 sm:py-11">
          <form className="w-full" onSubmit={onSubmit} noValidate>
            <FieldGroup className="gap-7">
              <div className="flex flex-col items-center gap-2.5 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Create your account
                </h1>
                <p className="text-balance text-[15px] leading-relaxed text-muted-foreground">
                  Sign up with your name, email, and a password
                </p>
              </div>

              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  placeholder="Your name"
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
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  className="h-12 rounded-xl text-base"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.password}
                  className="h-12 rounded-xl text-base"
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Field>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 rounded-xl text-[15px] font-medium"
                  disabled={registerUser.isPending}
                  data-icon={registerUser.isPending ? "inline-start" : undefined}
                >
                  {registerUser.isPending && <Spinner />}
                  {registerUser.isPending ? "Creating account" : "Sign up"}
                </Button>
              </Field>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={LOGIN_ROUTE}
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Log in
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}