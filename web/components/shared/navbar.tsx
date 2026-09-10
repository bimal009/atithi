'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
}

type NavCategory = {
  name: string
  items: NavItem[]
}

type NavbarProps = {
  nav: NavCategory[]
  ctaLabel?: string
  ctaHref?: string
}

function MobileNav({ nav }: { nav: NavCategory[] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'extend-touch-target block size-8 touch-manipulation items-center justify-start gap-2.5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent md:hidden dark:hover:bg-transparent'
            )}
          />
        }
      >
        <div className="relative flex items-center justify-center">
          <div className="relative size-4">
            <span
              className={cn(
                'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                open ? 'top-[0.4rem] -rotate-45' : 'top-1'
              )}
            />
            <span
              className={cn(
                'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                open ? 'top-[0.4rem] rotate-45' : 'top-2.5'
              )}
            />
          </div>
          <span className="sr-only">Toggle Menu</span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background/90 no-scrollbar h-(--radix-popover-content-available-height) w-(--radix-popover-content-available-width) overflow-y-auto rounded-none border-none p-0 shadow-none backdrop-blur duration-100"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={4}
      >
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          {nav.map((category, index) => (
            <div className="flex flex-col gap-4" key={index}>
              <p className="text-muted-foreground text-sm font-medium">
                {category.name}
              </p>
              <div className="flex flex-col gap-3">
                {category.items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-2xl font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function Navbar({ nav, ctaLabel = 'Book now', ctaHref = '#' }: NavbarProps) {
  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.svg"
            alt="atithi"
            width={280}
            height={44}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((category, index) => (
            <div key={index} className="group relative">
              <button className="text-foreground/80 hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors">
                {category.name}
              </button>
              <div className="invisible absolute top-full left-1/2 z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <div className="bg-popover border-border flex flex-col gap-1 rounded-lg border p-2 shadow-md">
                  {category.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Right side: CTA + mobile trigger */}
        <div className="flex items-center gap-2">
          <Button  className="hidden md:inline-flex">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <MobileNav nav={nav} />
        </div>
      </div>
    </header>
  )
}