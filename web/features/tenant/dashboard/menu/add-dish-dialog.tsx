"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlusIcon, PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { ADD_ONS, MENU_CATEGORIES, getSubMenusForCategory } from "@/lib/mock-data"
import { formatCurrency, generateId } from "@/lib/utils"
import { FOOD_TYPE_OPTIONS } from "@/lib/food-type"
import type { FoodType, MenuItem } from "@/types"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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

const dishSchema = z.object({
  foodType: z.enum(["veg", "non-veg", "vegan", "egg"]),
  name: z.string().trim().min(2, "Enter a dish name").max(150),
  category: z.string().min(1, "Select a category"),
  price: z.coerce.number().min(0, "Enter a valid price"),
  discount: z.string().trim().optional(),
  description: z.string().trim().max(1000).optional(),
  ingredients: z.string().trim().max(1000).optional(),
  available: z.boolean(),
})

type DishInput = z.input<typeof dishSchema>
type DishValues = z.output<typeof dishSchema>

const emptyValues: DishInput = {
  name: "",
  category: MENU_CATEGORIES[0],
  foodType: "veg",
  price: 0,
  discount: "",
  description: "",
  ingredients: "",
  available: true,
}

export function AddDishDialog({
  onCreate,
}: {
  onCreate: (item: MenuItem) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [photoUrl, setPhotoUrl] = React.useState<string | undefined>()
  const [addOnIds, setAddOnIds] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DishInput, unknown, DishValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: emptyValues,
  })

  const foodType = watch("foodType")
  const category = watch("category")
  const derivedSubMenus = getSubMenusForCategory(category)
  const available = watch("available")

  function toggleAddOn(id: string) {
    setAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function resetAll() {
    reset(emptyValues)
    setPhotoUrl(undefined)
    setAddOnIds([])
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUrl(URL.createObjectURL(file))
  }

  const onSubmit = handleSubmit((values) => {
    onCreate({
      id: generateId("m"),
      name: values.name,
      category: values.category,
      price: values.price,
      discount: values.discount ? Number(values.discount) : undefined,
      foodType: values.foodType,
      available: values.available,
      description: values.description || undefined,
      ingredients: values.ingredients || undefined,
      photoUrl,
      addOnIds: addOnIds.length ? addOnIds : undefined,
    })
    setOpen(false)
    resetAll()
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetAll()
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Dish
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Create dish</DialogTitle>
            <DialogDescription>
              New dishes are marked available right away.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.foodType}>
                <FieldLabel htmlFor="dish-type">Type</FieldLabel>
                <Select
                  items={Object.fromEntries(FOOD_TYPE_OPTIONS.map((o) => [o.value, o.label]))}
                  value={foodType}
                  onValueChange={(v) =>
                    setValue("foodType", (v ?? "veg") as FoodType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="dish-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.foodType]} />
              </Field>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="dish-name">Dish name</FieldLabel>
                <Input
                  id="dish-name"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                  placeholder="Chicken Sekuwa"
                />
                <FieldError errors={[errors.name]} />
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

            <Field data-invalid={!!errors.category}>
              <FieldLabel htmlFor="dish-category">Category</FieldLabel>
              <Select
                value={category}
                onValueChange={(v) =>
                  setValue("category", v ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="dish-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENU_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                {derivedSubMenus.length > 0
                  ? `Shows up on ${derivedSubMenus.join(", ")}, set on the category.`
                  : "This category isn't on any sub-menu yet."}
              </FieldDescription>
              <FieldError errors={[errors.category]} />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.price}>
                <FieldLabel htmlFor="dish-price">Actual price (Rs)</FieldLabel>
                <Input
                  id="dish-price"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.price}
                  {...register("price")}
                  placeholder="280"
                />
                <FieldError errors={[errors.price]} />
              </Field>
              <Field data-invalid={!!errors.discount}>
                <FieldLabel htmlFor="dish-discount">Discount (Rs, optional)</FieldLabel>
                <Input
                  id="dish-discount"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.discount}
                  {...register("discount")}
                  placeholder="0"
                />
                <FieldError errors={[errors.discount]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="dish-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="dish-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="Shown to guests on the ordering screen."
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={!!errors.ingredients}>
              <FieldLabel htmlFor="dish-ingredients">
                Ingredients (optional)
              </FieldLabel>
              <Textarea
                id="dish-ingredients"
                aria-invalid={!!errors.ingredients}
                {...register("ingredients")}
                placeholder="Chicken, yogurt, ginger-garlic paste, spices"
              />
              <FieldError errors={[errors.ingredients]} />
            </Field>

            <Field>
              <FieldLabel>Available add-ons</FieldLabel>
              <FieldDescription>
                Extras guests can attach to this dish when ordering.
              </FieldDescription>
              <div className="flex max-h-40 flex-col gap-0.5 overflow-y-auto scrollbar-none rounded-lg border p-1">
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
                checked={available}
                onCheckedChange={(checked) =>
                  setValue("available", checked, { shouldValidate: true })
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
