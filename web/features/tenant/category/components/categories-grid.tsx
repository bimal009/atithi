"use client";

import * as React from "react";
import { FolderPlusIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { SectionCards } from "@/components/shared/section-cards";
import { useSubMenusQuery } from "@/features/tenant/subMenu/client/useSubMenus";

import { useRemoveCategory } from "../client/useCategories";
import type { Category } from "../types";
import { CategoryFormDialog } from "./category-form-dialog";

export function CategoriesGrid({
  tenant,
  categories,
  total,
  search,
  onSearchChange,
  page,
  pageCount,
  onPageChange,
}: {
  tenant: string;
  categories: Category[];
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Category | null>(null);
  const remove = useRemoveCategory(tenant);

  const subMenusQuery = useSubMenusQuery(tenant, { limit: 100 });
  const subMenus = subMenusQuery.data?.subMenus ?? [];

  const unassigned = categories.filter((c) => c.subMenus.length === 0).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description={`${total} menu categories across ${subMenus.length} sub-menus`}
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Category
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Categories", value: String(total) },
          { label: "Sub-menus", value: String(subMenus.length) },
          {
            label: "Unassigned",
            value: String(unassigned),
            description: "No sub-menu set, on this page",
          },
        ]}
      />

      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search categories…"
        className="sm:max-w-xs"
      />

      {categories.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <EmptyState
              icon={FolderPlusIcon}
              title="No categories yet"
              description={
                search
                  ? "No categories match your search."
                  : "Add your first category to start organizing dishes."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id} className="gap-2">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => setEditing(category)}
                          >
                            <PencilIcon aria-hidden />
                          </Button>
                        }
                      />
                      <TooltipContent>Edit category</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            aria-label={`Delete ${category.name}`}
                            onClick={() => setPendingDelete(category)}
                          >
                            <Trash2Icon aria-hidden />
                          </Button>
                        }
                      />
                      <TooltipContent>Delete category</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {category.subMenus.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No sub-menus assigned</span>
                  ) : (
                    category.subMenus.map((sm) => (
                      <Badge key={sm.id} variant="outline" className="font-normal">
                        {sm.name}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationFooter page={page} pageCount={pageCount} onPageChange={onPageChange} />

      <CategoryFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <CategoryFormDialog
        tenant={tenant}
        category={editing ?? undefined}
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
              Dishes still using this category must be updated first.
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
