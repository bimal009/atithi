"use client";

import * as React from "react";
import { LayersIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { SectionCards } from "@/components/shared/section-cards";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useRemoveSubMenu } from "../client/useSubMenus";
import type { SubMenu } from "../types";
import { SubMenuFormDialog } from "./sub-menu-form-dialog";

export function SubMenusGrid({
  tenant,
  subMenus,
  total,
  search,
  onSearchChange,
  page,
  pageCount,
  onPageChange,
}: {
  tenant: string;
  subMenus: SubMenu[];
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<SubMenu | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<SubMenu | null>(null);
  const remove = useRemoveSubMenu(tenant);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sub Menu"
        description="Group categories under a sub-menu, such as breakfast vs all-day dining."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Sub-Menu
          </Button>
        }
      />

      <SectionCards stats={[{ label: "Sub-menus", value: String(total) }]} />

      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search sub-menus…"
        className="sm:max-w-xs"
      />

      {subMenus.length === 0 ? (
        <Card>
          <CardContent className="py-2">
            <EmptyState
              icon={LayersIcon}
              title="No sub-menus yet"
              description={
                search
                  ? "No sub-menus match your search."
                  : "Add your first sub-menu to start grouping categories."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subMenus.map((subMenu) => (
            <Card key={subMenu.id} className="gap-2">
              <CardContent className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subMenu.name}</span>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                            aria-label={`Edit ${subMenu.name}`}
                            onClick={() => setEditing(subMenu)}
                          >
                            <PencilIcon aria-hidden />
                          </Button>
                        }
                      />
                      <TooltipContent>Edit sub-menu</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            aria-label={`Delete ${subMenu.name}`}
                            onClick={() => setPendingDelete(subMenu)}
                          >
                            <Trash2Icon aria-hidden />
                          </Button>
                        }
                      />
                      <TooltipContent>Delete sub-menu</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {subMenu.description && (
                  <p className="text-sm text-muted-foreground">{subMenu.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationFooter page={page} pageCount={pageCount} onPageChange={onPageChange} />

      <SubMenuFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <SubMenuFormDialog
        tenant={tenant}
        subMenu={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Categories still assigned to this sub-menu must be updated first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              disabled={remove.isPending}
              onClick={async () => {
                if (!pendingDelete) return;
                await remove.mutateAsync(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              {remove.isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
