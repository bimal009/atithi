"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FolderPlusIcon, PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { MENU_ITEMS, SUB_MENUS } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(100),
  subMenu: z.string().min(1, "Select a sub-menu"),
  description: z.string().trim().max(500).optional(),
})

type CategoryValues = z.infer<typeof categorySchema>

const emptyValues: CategoryValues = {
  name: "",
  subMenu: SUB_MENUS[0].name,
  description: "",
}

function AddCategoryDialog({ onCreate }: { onCreate: (form: CategoryValues) => void }) {
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyValues,
  })

  const subMenu = watch("subMenu")

  const onSubmit = handleSubmit((values) => {
    onCreate(values)
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
        Add Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a category</DialogTitle>
            <DialogDescription>
              Group dishes on the menu and in the ordering screen.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="category-name">Category name</FieldLabel>
              <Input
                id="category-name"
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Tandoor"
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.subMenu}>
              <FieldLabel htmlFor="category-submenu">Sub-menu</FieldLabel>
              <Select
                value={subMenu}
                onValueChange={(value) =>
                  setValue("subMenu", value ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="category-submenu" className="w-full">
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
              <FieldError errors={[errors.subMenu]} />
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="category-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="category-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="Shown as a subtitle on the ordering screen."
              />
              <FieldError errors={[errors.description]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">Add category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function MenuCategoriesPage() {
  const [categories, setCategories] = React.useState(
    Array.from(new Set(MENU_ITEMS.map((m) => m.category)))
  )

  const dishCount = MENU_ITEMS.length
  const emptyCategories = categories.filter(
    (c) => MENU_ITEMS.filter((m) => m.category === c).length === 0
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description={`${categories.length} menu categories`}
        actions={
          <AddCategoryDialog
            onCreate={(form) => setCategories((prev) => [...prev, form.name])}
          />
        }
      />

      <SectionCards
        stats={[
          { label: "Categories", value: String(categories.length) },
          { label: "Sub-menus", value: String(SUB_MENUS.length) },
          { label: "Dishes covered", value: String(dishCount) },
          { label: "Empty categories", value: String(emptyCategories) },
        ]}
      />

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-2">
            <EmptyState
              icon={FolderPlusIcon}
              title="No categories yet"
              description="Add your first category to start organizing dishes."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const count = MENU_ITEMS.filter((m) => m.category === category).length
            return (
              <Card key={category} className="gap-2">
                <CardContent className="flex flex-col gap-1.5">
                  <span className="font-medium">{category}</span>
                  <Badge variant="secondary" className="w-fit">
                    {count} {count === 1 ? "dish" : "dishes"}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
