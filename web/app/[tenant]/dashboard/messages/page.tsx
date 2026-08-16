"use client"

import * as React from "react"
import { ArrowLeftIcon, MessageSquareIcon, SearchIcon, SendIcon } from "lucide-react"

import { BOOKING_CHANNELS, CONVERSATIONS } from "@/lib/mock-data"
import { cn, timeAgo } from "@/lib/utils"
import type { BookingChannel, Conversation } from "@/types"
import { PageHeader } from "@/components/shared/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CHANNEL_META } from "@/features/tenant/dashboard/bookings/channel-badge"

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}

const CHANNEL_FILTERS: Array<{ value: "all" | BookingChannel; label: string }> = [
  { value: "all", label: "All channels" },
  ...BOOKING_CHANNELS,
]

export default function MessagesPage() {
  const [conversations, setConversations] = React.useState(CONVERSATIONS)
  const [channel, setChannel] = React.useState<"all" | BookingChannel>("all")
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(
    conversations[0]?.id ?? null
  )
  const [draft, setDraft] = React.useState("")

  const filtered = conversations
    .filter((c) => channel === "all" || c.channel === channel)
    .filter((c) => c.guestName.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      const aLast = a.messages.at(-1)?.sentAt ?? ""
      const bLast = b.messages.at(-1)?.sentAt ?? ""
      return +new Date(bLast) - +new Date(aLast)
    })

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  function openConversation(conversation: Conversation) {
    setSelectedId(conversation.id)
    if (conversation.unread > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, unread: 0 } : c))
      )
    }
  }

  function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !draft.trim()) return
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `local-${Date.now()}`,
                  sender: "staff",
                  text: draft.trim(),
                  sentAt: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    )
    setDraft("")
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Every guest conversation from WhatsApp, Instagram and Facebook, in one inbox."
      />

      <Card className="flex h-[min(70vh,700px)] flex-row overflow-hidden p-0">
        <div
          className={cn(
            "flex w-full shrink-0 flex-col border-r sm:w-80",
            selected && "hidden sm:flex"
          )}
        >
          <div className="flex flex-col gap-2 border-b p-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guests…"
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_FILTERS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={channel === option.value ? "secondary" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setChannel(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="scrollbar-none flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
                <MessageSquareIcon className="size-6" aria-hidden />
                No conversations found.
              </div>
            ) : (
              filtered.map((conversation) => {
                const last = conversation.messages.at(-1)
                const Icon = CHANNEL_META[conversation.channel].icon
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation)}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 border-b p-3 text-left transition-colors hover:bg-muted/50",
                      selectedId === conversation.id && "bg-muted"
                    )}
                  >
                    <Avatar className="mt-0.5">
                      <AvatarFallback>{initialsOf(conversation.guestName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {conversation.guestName}
                        </span>
                        {last && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {timeAgo(last.sentAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="truncate text-xs text-muted-foreground">
                          {last?.text ?? "No messages yet"}
                        </span>
                      </div>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge className="mt-0.5 size-5 shrink-0 justify-center rounded-full p-0 tabular-nums">
                        {conversation.unread}
                      </Badge>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className={cn("flex min-w-0 flex-1 flex-col", !selected && "hidden sm:flex")}>
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <MessageSquareIcon className="size-8" aria-hidden />
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b p-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="sm:hidden"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeftIcon aria-hidden />
                </Button>
                <Avatar>
                  <AvatarFallback>{initialsOf(selected.guestName)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{selected.guestName}</span>
                  <span className="text-xs text-muted-foreground">
                    {CHANNEL_META[selected.channel].label}
                    {selected.guestPhone ? ` · ${selected.guestPhone}` : ""}
                  </span>
                </div>
              </div>

              <div className="scrollbar-none flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {selected.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col gap-1",
                      message.sender === "staff" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        message.sender === "staff"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.text}
                    </div>
                    <span className="px-1 text-[11px] text-muted-foreground">
                      {timeAgo(message.sentAt)}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={sendReply} className="flex items-center gap-2 border-t p-3">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Reply on ${CHANNEL_META[selected.channel].label}…`}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!draft.trim()}>
                  <SendIcon aria-hidden />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
