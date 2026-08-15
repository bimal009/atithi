"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import { MENU_ITEMS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { MenuSet } from "@/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function emptyForm() {
  return { name: "", description: "", price: "" }
}

export function AddMenuSetSheet({
  onCreate,
}: {
  onCreate: (menuSet: MenuSet) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())
  const [itemIds, setItemIds] = React.useState<string[]>([])

  function toggleItem(id: string) {
    setItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || itemIds.length === 0) return
    onCreate({
      id: `ms${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      itemIds,
      price: Number(form.price) || 0,
      available: true,
    })
    setOpen(false)
    setForm(emptyForm())
    setItemIds([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Menu Set
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a menu set</DialogTitle>
            <DialogDescription>
              Bundle a few dishes into a combo at a special price.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
            <Field>
              <FieldLabel htmlFor="set-name">Set name</FieldLabel>
              <Input
                id="set-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Momo Combo"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="set-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="set-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What's included, in one line."
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="set-price">Set price (Rs)</FieldLabel>
              <Input
                id="set-price"
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="250"
              />
            </Field>
            <Field>
              <FieldLabel>Included dishes</FieldLabel>
              <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto scrollbar-none rounded-lg border p-1">
                {MENU_ITEMS.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={itemIds.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(item.price)}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={itemIds.length === 0}>
              Add menu set
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
