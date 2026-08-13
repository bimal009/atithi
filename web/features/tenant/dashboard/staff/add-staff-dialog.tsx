"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { StaffMember, StaffRole } from "@/types"
import { ROLE_LABELS } from "@/features/tenant/dashboard/nav-config"
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
import { Textarea } from "@/components/ui/textarea"

const ASSIGNABLE_ROLES: StaffRole[] = ["frontdesk", "waiter", "kitchen", "owner"]

function emptyForm() {
  return {
    name: "",
    email: "",
    phone: "",
    role: "frontdesk" as StaffRole,
    notes: "",
  }
}

export function AddStaffDialog({
  onCreate,
}: {
  onCreate: (staff: StaffMember) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCreate({
      id: `st${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      status: "active",
      joinedAt: new Date().toISOString().slice(0, 10),
    })
    setOpen(false)
    setForm(emptyForm())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Staff
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a staff member</DialogTitle>
            <DialogDescription>
              They&apos;ll show up as active right away.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] overflow-y-auto py-4">
            <Field>
              <FieldLabel htmlFor="staff-name">Full name</FieldLabel>
              <Input
                id="staff-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nabin Shrestha"
              />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="staff-email">Email</FieldLabel>
                <Input
                  id="staff-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="name@hotel.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="staff-phone">Phone</FieldLabel>
                <Input
                  id="staff-phone"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="98X-XXXXXXX"
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="staff-role">Role</FieldLabel>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, role: (value as StaffRole) ?? f.role }))
                }
              >
                <SelectTrigger id="staff-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="staff-notes">Notes (optional)</FieldLabel>
              <Textarea
                id="staff-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Shift preference, certifications, etc."
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Add staff member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
