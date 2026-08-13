"use client"

import * as React from "react"
import { FolderPlusIcon, PlusIcon } from "lucide-react"

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
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

interface CategoryForm {
  name: string
  subMenu: string
  description: string
}

function AddCategoryDialog({ onCreate }: { onCreate: (form: CategoryForm) => void }) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<CategoryForm>({
    name: "",
    subMenu: SUB_MENUS[0].name,
    description: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onCreate(form)
    setOpen(false)
    setForm({ name: "", subMenu: SUB_MENUS[0].name, description: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a category</DialogTitle>
            <DialogDescription>
              Group dishes on the menu and in the ordering screen.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="category-name">Category name</FieldLabel>
              <Input
                id="category-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Tandoor"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-submenu">Sub-menu</FieldLabel>
              <Select
                value={form.subMenu}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, subMenu: value ?? f.subMenu }))
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
            </Field>
            <Field>
              <FieldLabel htmlFor="category-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Shown as a subtitle on the ordering screen."
              />
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
  usePageTitle("Categories")
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
