"use client"

import { useTheme } from "next-themes"
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react"

import { useLogout } from "@/features/auth/client/useAuth"
import type { AuthUser } from "@/features/auth/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function NavUser({ user }: { user: AuthUser }) {
  const { theme, setTheme } = useTheme()
  const logout = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-9 gap-2 px-1.5" />}
      >
        <Avatar size="sm">
          {user.image ? (
            <AvatarImage src={user.image} alt="" className="object-contain" />
          ) : null}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-xs font-medium">{user.name}</span>
          <span className="text-[11px] text-muted-foreground">{user.email}</span>
        </div>
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar size="sm">
                {user.image ? (
                  <AvatarImage src={user.image} alt="" className="object-contain" />
                ) : null}
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserRoundIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunIcon className="dark:hidden" />
              <MoonIcon className="hidden dark:block" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">
                  <SunIcon />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <MoonIcon />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <MonitorIcon />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOutIcon />
          {logout.isPending ? "Logging out" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
