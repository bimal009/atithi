"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FolderPlusIcon, PlusIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CATEGORY_SUB_MENUS, MENU_ITEMS } from "@/lib/mock-data"
import { useSubMenusQuery } from "@/features/tenant/subMenu/client/useSubMenus"
import type { SubMenu } from "@/features/tenant/subMenu/types"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { EmptyState } from "@/components/shared/empty-state"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// DUMMY PROTOTYPE: a category can belong to more than one sub-menu (many-to-many),
// instead of the single required sub-menu it has today. Local state only, no backend.
type CategoryEntry = {
  name: string
  subMenus: string[]
}

const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(100),
  subMenus: z.array(z.string()).min(1, "Select at least one sub-menu"),
  description: z.string().trim().max(500).optional(),
})

type CategoryValues = z.infer<typeof categorySchema>

const emptyValues: CategoryValues = {
  name: "",
  subMenus: [],
  description: "",
}

function AddCategoryDialog({
  subMenus,
  onCreate,
}: {
  subMenus: SubMenu[]
  onCreate: (form: CategoryValues) => void
}) {
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

  const selectedSubMenus = watch("subMenus")

  function toggleSubMenu(name: string) {
    const next = selectedSubMenus.includes(name)
      ? selectedSubMenus.filter((s) => s !== name)
      : [...selectedSubMenus, name]
    setValue("subMenus", next, { shouldValidate: true })
  }

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
            <Field data-invalid={!!errors.subMenus}>
              <FieldLabel>Sub-menus</FieldLabel>
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                {subMenus.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sub-menus yet. Add one under Sub Menu first.
                  </p>
                ) : (
                  subMenus.map((sm) => (
                    <label
                      key={sm.id}
                      className="flex cursor-pointer items-center gap-2.5 text-sm"
                    >
                      <Checkbox
                        checked={selectedSubMenus.includes(sm.name)}
                        onCheckedChange={() => toggleSubMenu(sm.name)}
                      />
                      {sm.name}
                    </label>
                  ))
                )}
              </div>
              <FieldError errors={[errors.subMenus]} />
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
  const { tenant } = useParams<{ tenant: string }>()
  const subMenusQuery = useSubMenusQuery(tenant)
  const subMenus = subMenusQuery.data ?? []

  const [categories, setCategories] = React.useState<CategoryEntry[]>(
    Array.from(new Set(MENU_ITEMS.map((m) => m.category))).map((name) => ({
      name,
      subMenus: CATEGORY_SUB_MENUS[name] ?? [],
    }))
  )

  const dishCount = MENU_ITEMS.length
  const emptyCategories = categories.filter(
    (c) => MENU_ITEMS.filter((m) => m.category === c.name).length === 0
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description={`${categories.length} menu categories, dummy many-to-many sub-menus`}
        actions={
          <AddCategoryDialog
            subMenus={subMenus}
            onCreate={(form) =>
              setCategories((prev) => [
                ...prev,
                { name: form.name, subMenus: form.subMenus },
              ])
            }
          />
        }
      />

      <SectionCards
        stats={[
          { label: "Categories", value: String(categories.length) },
          { label: "Sub-menus", value: String(subMenus.length) },
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
            const count = MENU_ITEMS.filter((m) => m.category === category.name).length
            return (
              <Card key={category.name} className="gap-2">
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary">
                      {count} {count === 1 ? "dish" : "dishes"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {category.subMenus.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        No sub-menus assigned
                      </span>
                    ) : (
                      category.subMenus.map((sm) => (
                        <Badge key={sm} variant="outline" className="font-normal">
                          {sm}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
