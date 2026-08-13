"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { AddOn } from "@/types"
import { Button } from "@/components/ui/button"
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

function emptyForm() {
  return { name: "", price: "" }
}

export function AddAddOnSheet({
  onCreate,
}: {
  onCreate: (addOn: AddOn) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onCreate({
      id: `ad${Date.now()}`,
      name: form.name.trim(),
      price: Number(form.price) || 0,
      available: true,
    })
    setOpen(false)
    setForm(emptyForm())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Add-on
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add an add-on</DialogTitle>
            <DialogDescription>
              Extras guests can attach to a dish when ordering, like extra
              cheese or extra spicy.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="addon-name">Add-on name</FieldLabel>
              <Input
                id="addon-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Extra Cheese"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="addon-price">Price (Rs)</FieldLabel>
              <Input
                id="addon-price"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="60"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">Add add-on</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
