"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Table } from "@/types"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SECTIONS = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "rooftop", label: "Rooftop" },
] as const

const tableSchema = z.object({
  name: z.string().trim().min(1, "Enter a table name").max(50),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  section: z.enum(["indoor", "outdoor", "rooftop"]),
})

type TableInput = z.input<typeof tableSchema>
type TableValues = z.output<typeof tableSchema>

const emptyValues: TableInput = { name: "", capacity: 2, section: "indoor" }

export function AddTableDialog({
  onCreate,
}: {
  onCreate: (table: Table) => void
}) {
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TableInput, unknown, TableValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: emptyValues,
  })

  const section = watch("section")

  const onSubmit = handleSubmit((values) => {
    onCreate({
      id: `tb${Date.now()}`,
      name: values.name.trim(),
      capacity: values.capacity,
      section: values.section,
    })
    setOpen(false)
    reset(emptyValues)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset(emptyValues)
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Table
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a table</DialogTitle>
            <DialogDescription>New tables start out free.</DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="table-name">Table name</FieldLabel>
              <Input
                id="table-name"
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Table 9"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.capacity}>
                <FieldLabel htmlFor="table-capacity">Capacity</FieldLabel>
                <Input
                  id="table-capacity"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.capacity}
                  {...register("capacity")}
                />
                <FieldError errors={[errors.capacity]} />
              </Field>
              <Field data-invalid={!!errors.section}>
                <FieldLabel htmlFor="table-section">Section</FieldLabel>
                <Select
                  value={section}
                  onValueChange={(value) =>
                    setValue("section", (value ?? "indoor") as TableValues["section"], {
                      shouldValidate: true,
                    })
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
                <FieldError errors={[errors.section]} />
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
