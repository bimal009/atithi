"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { Table, TableSection } from "@/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SECTIONS: Array<{ value: TableSection; label: string }> = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "rooftop", label: "Rooftop" },
]

function emptyForm() {
  return {
    name: "",
    capacity: "2",
    section: "indoor" as TableSection,
  }
}

export function AddTableDialog({
  onCreate,
}: {
  onCreate: (table: Table) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    onCreate({
      id: `tb${Date.now()}`,
      name: form.name.trim(),
      capacity: Number(form.capacity) || 1,
      section: form.section,
    })
    setOpen(false)
    setForm(emptyForm())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Table
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a table</DialogTitle>
            <DialogDescription>New tables start out free.</DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
            <Field>
              <FieldLabel htmlFor="table-name">Table name</FieldLabel>
              <Input
                id="table-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Table 9"
              />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="table-capacity">Capacity</FieldLabel>
                <Input
                  id="table-capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="table-section">Section</FieldLabel>
                <Select
                  value={form.section}
                  onValueChange={(value) =>
                    setForm((f) => ({
                      ...f,
                      section: (value as TableSection) ?? f.section,
                    }))
                  }
                >
                  <SelectTrigger id="table-section" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Add table</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
