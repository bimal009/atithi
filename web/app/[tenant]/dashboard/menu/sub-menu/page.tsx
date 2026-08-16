"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { LayersIcon, PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { MENU_ITEMS, SUB_MENUS } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { EmptyState } from "@/components/shared/empty-state"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"
import type { SubMenu } from "@/types"

const subMenuSchema = z.object({
  name: z.string().trim().min(2, "Enter a sub-menu name").max(100),
  description: z.string().trim().max(500).optional(),
})

type SubMenuValues = z.infer<typeof subMenuSchema>

const emptyValues: SubMenuValues = { name: "", description: "" }

function AddSubMenuDialog({ onCreate }: { onCreate: (subMenu: SubMenu) => void }) {
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubMenuValues>({
    resolver: zodResolver(subMenuSchema),
    defaultValues: emptyValues,
  })

  const onSubmit = handleSubmit((values) => {
    onCreate({
      id: `sm${Date.now()}`,
      name: values.name,
      description: values.description || undefined,
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
        Add Sub-Menu
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a sub-menu</DialogTitle>
            <DialogDescription>
              Sub-menus group categories — like &ldquo;Restaurant Menu&rdquo; or
              &ldquo;Bar Menu&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="submenu-name">Sub-menu name</FieldLabel>
              <Input
                id="submenu-name"
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Breakfast Menu"
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="submenu-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="submenu-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="Served 7 AM – 10 AM."
              />
              <FieldError errors={[errors.description]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">Add sub-menu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SubMenuPage() {
  usePageTitle("Sub Menu")
  const [subMenus, setSubMenus] = React.useState(SUB_MENUS)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sub Menu"
        description="Group categories under a sub-menu, like breakfast vs. all-day dining."
        actions={
          <AddSubMenuDialog onCreate={(sm) => setSubMenus((prev) => [...prev, sm])} />
        }
      />

      <SectionCards
        stats={[
          { label: "Sub-menus", value: String(subMenus.length) },
          {
            label: "Categories covered",
            value: String(new Set(MENU_ITEMS.map((m) => m.category)).size),
          },
          { label: "Total dishes", value: String(MENU_ITEMS.length) },
        ]}
      />

      {subMenus.length === 0 ? (
        <Card>
          <CardContent className="py-2">
            <EmptyState
              icon={LayersIcon}
              title="No sub-menus yet"
              description="Add your first sub-menu to start grouping categories."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subMenus.map((subMenu) => {
            const dishCount = MENU_ITEMS.filter(
              (m) => m.subMenu === subMenu.name
            ).length
            return (
              <Card key={subMenu.id} className="gap-2">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{subMenu.name}</span>
                    <Badge variant="secondary">
                      {dishCount} {dishCount === 1 ? "dish" : "dishes"}
                    </Badge>
                  </div>
                  {subMenu.description && (
                    <p className="text-sm text-muted-foreground">
                      {subMenu.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
