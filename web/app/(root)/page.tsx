import Link from "next/link"
import {
  BedDoubleIcon,
  CalendarCheckIcon,
  ChefHatIcon,
  HotelIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const FEATURES = [
  {
    icon: CalendarCheckIcon,
    title: "Bookings",
    description: "Track reservations, check-ins, and check-outs in one place.",
  },
  {
    icon: BedDoubleIcon,
    title: "Rooms",
    description: "See room status at a glance — available, occupied, cleaning.",
  },
  {
    icon: ChefHatIcon,
    title: "Restaurant orders",
    description: "Waiters send KOTs to the kitchen without a single phone call.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <HotelIcon className="size-5" />
            <span className="text-lg font-semibold">Atithi</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
            <Button nativeButton={false} render={<Link href="/signup" />}>Sign up</Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Run your hotel without the WhatsApp chaos
          </h1>
          <p className="text-balance text-lg text-muted-foreground">
            Atithi brings bookings, rooms, staff, and restaurant orders into
            one dashboard built for independent hotels in Nepal.
          </p>
          <div className="flex items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
              Get started
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col gap-2">
                <feature.icon className="size-5 text-primary" />
                <h3 className="font-heading text-sm font-medium">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
