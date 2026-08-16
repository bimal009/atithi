"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { MENU_ITEMS } from "@/lib/mock-data"
import { formatCurrency, generateId } from "@/lib/utils"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const menuSetSchema = z.object({
  name: z.string().trim().min(2, "Enter a set name").max(150),
  description: z.string().trim().max(500).optional(),
  price: z.coerce.number().min(0, "Enter a valid price"),
})

type MenuSetInput = z.input<typeof menuSetSchema>
type MenuSetValues = z.output<typeof menuSetSchema>

const emptyValues: MenuSetInput = { name: "", description: "", price: 0 }

export function AddMenuSetSheet({
  onCreate,
}: {
  onCreate: (menuSet: MenuSet) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [itemIds, setItemIds] = React.useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuSetInput, unknown, MenuSetValues>({
    resolver: zodResolver(menuSetSchema),
    defaultValues: emptyValues,
  })

  function toggleItem(id: string) {
    setItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const onSubmit = handleSubmit((values) => {
    if (itemIds.length === 0) return

    onCreate({
      id: generateId("ms"),
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      itemIds,
      price: values.price,
      available: true,
    })
    setOpen(false)
    reset(emptyValues)
    setItemIds([])
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          reset(emptyValues)
          setItemIds([])
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Menu Set
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a menu set</DialogTitle>
            <DialogDescription>
              Bundle a few dishes into a combo at a special price.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="set-name">Set name</FieldLabel>
              <Input
                id="set-name"
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Momo Combo"
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="set-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="set-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="What's included, in one line."
              />
              <FieldError errors={[errors.description]} />
            </Field>
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="set-price">Set price (Rs)</FieldLabel>
              <Input
                id="set-price"
                type="number"
                min={0}
                aria-invalid={!!errors.price}
                {...register("price")}
                placeholder="250"
              />
              <FieldError errors={[errors.price]} />
            </Field>
            <Field data-invalid={itemIds.length === 0}>
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
              {itemIds.length === 0 && (
                <p className="text-sm text-destructive">Select at least one dish.</p>
              )}
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
