"use client"

import * as React from "react"
import { LayersIcon, PlusIcon } from "lucide-react"

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"
import type { SubMenu } from "@/types"

function AddSubMenuDialog({ onCreate }: { onCreate: (subMenu: SubMenu) => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ id: `sm${Date.now()}`, name: name.trim(), description: description.trim() || undefined })
    setOpen(false)
    setName("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Sub-Menu
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a sub-menu</DialogTitle>
            <DialogDescription>
              Sub-menus group categories — like &ldquo;Restaurant Menu&rdquo; or
              &ldquo;Bar Menu&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="submenu-name">Sub-menu name</FieldLabel>
              <Input
                id="submenu-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Breakfast Menu"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="submenu-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="submenu-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Served 7 AM – 10 AM."
              />
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
