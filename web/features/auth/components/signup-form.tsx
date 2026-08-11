import Link from "next/link"
import { HotelIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-foreground"
      >
        <HotelIcon className="size-5" />
        <span className="text-lg font-semibold">Atithi</span>
      </Link>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form className="w-full">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Set up your hotel</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Start managing bookings and orders in minutes
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="hotel-name">Hotel name</FieldLabel>
                <Input
                  id="hotel-name"
                  placeholder="Hotel Himalaya View"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="owner-name">Owner name</FieldLabel>
                <Input id="owner-name" placeholder="Bimal Thapa" required />
              </Field>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@yourhotel.com"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    required
                  />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" required />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Create account</Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Log in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to Atithi&apos;s <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
