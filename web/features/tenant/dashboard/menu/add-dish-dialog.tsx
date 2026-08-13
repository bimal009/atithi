"use client"

import * as React from "react"
import { ImagePlusIcon, PlusIcon } from "lucide-react"

import { ADD_ONS, MENU_CATEGORIES, SUB_MENUS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { MenuItem } from "@/types"
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

function emptyForm() {
  return {
    name: "",
    subMenu: SUB_MENUS[0].name,
    category: MENU_CATEGORIES[0],
    isVeg: "veg",
    price: "",
    discount: "",
    description: "",
    ingredients: "",
    available: true,
  }
}

export function AddDishDialog({
  onCreate,
}: {
  onCreate: (item: MenuItem) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())
  const [photoUrl, setPhotoUrl] = React.useState<string | undefined>()
  const [addOnIds, setAddOnIds] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function toggleAddOn(id: string) {
    setAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function reset() {
    setForm(emptyForm())
    setPhotoUrl(undefined)
    setAddOnIds([])
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUrl(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCreate({
      id: `m${Date.now()}`,
      name: form.name,
      subMenu: form.subMenu,
      category: form.category,
      price: Number(form.price) || 0,
      discount: form.discount ? Number(form.discount) : undefined,
      isVeg: form.isVeg === "veg",
      available: form.available,
      description: form.description || undefined,
      ingredients: form.ingredients || undefined,
      photoUrl,
      addOnIds: addOnIds.length ? addOnIds : undefined,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Dish
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create dish</DialogTitle>
            <DialogDescription>
              New dishes are marked available right away.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] overflow-y-auto py-4">
            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="dish-type">Type</FieldLabel>
                <Select
                  value={form.isVeg}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, isVeg: v ?? f.isVeg }))
                  }
                >
                  <SelectTrigger id="dish-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Veg</SelectItem>
                    <SelectItem value="non-veg">Non-veg</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="dish-name">Dish name</FieldLabel>
                <Input
                  id="dish-name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Chicken Sekuwa"
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel>Dish photo</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt="Dish preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1.5">
                    <ImagePlusIcon className="size-5" />
                    Click to upload
                  </span>
                )}
              </button>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="dish-submenu">Sub-menu</FieldLabel>
                <Select
                  value={form.subMenu}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, subMenu: v ?? f.subMenu }))
                  }
                >
                  <SelectTrigger id="dish-submenu" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUB_MENUS.map((sm) => (
                      <SelectItem key={sm.id} value={sm.name}>
                        {sm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="dish-category">Category</FieldLabel>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v ?? f.category }))
                  }
                >
                  <SelectTrigger id="dish-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="dish-price">Actual price (Rs)</FieldLabel>
                <Input
                  id="dish-price"
                  type="number"
                  min={0}
                  required
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="280"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="dish-discount">Discount (Rs, optional)</FieldLabel>
                <Input
                  id="dish-discount"
                  type="number"
                  min={0}
                  value={form.discount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discount: e.target.value }))
                  }
                  placeholder="0"
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="dish-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="dish-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Shown to guests on the ordering screen."
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dish-ingredients">
                Ingredients (optional)
              </FieldLabel>
              <Textarea
                id="dish-ingredients"
                value={form.ingredients}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ingredients: e.target.value }))
                }
                placeholder="Chicken, yogurt, ginger-garlic paste, spices"
              />
            </Field>

            <Field>
              <FieldLabel>Available add-ons</FieldLabel>
              <FieldDescription>
                Extras guests can attach to this dish when ordering.
              </FieldDescription>
              <div className="flex max-h-40 flex-col gap-0.5 overflow-y-auto rounded-lg border p-1">
                {ADD_ONS.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={addOnIds.includes(addOn.id)}
                      onCheckedChange={() => toggleAddOn(addOn.id)}
                    />
                    <span className="flex-1">{addOn.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {addOn.price === 0 ? "Free" : formatCurrency(addOn.price)}
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            <Field orientation="horizontal" className="justify-between">
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="dish-available">
                  Available for ordering
                </FieldLabel>
                <FieldDescription>
                  Turn off to hide this dish from waiters and guests.
                </FieldDescription>
              </div>
              <Switch
                id="dish-available"
                checked={form.available}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, available: checked }))
                }
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Save dish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
