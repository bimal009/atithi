"use client";

import * as React from "react";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
  ShieldUserIcon,
  Trash2Icon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDeleteRole } from "../client/useRoles";
import type { Permission, RoleSummary, RoleTab } from "../types";
import { RoleFormDialog } from "./role-form-dialog";
import { RolePermissionsDialog } from "./role-permissions-dialog";

function RoleCard({
  role,
  onView,
  onEdit,
  onDelete,
}: {
  role: RoleSummary;
  onView: (role: RoleSummary) => void;
  onEdit?: (role: RoleSummary) => void;
  onDelete?: (role: RoleSummary) => void;
}) {
  return (
    <Card>
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>{role.name}</CardTitle>
          {role.description && <CardDescription>{role.description}</CardDescription>}
        </div>
        {role.isSystem ? (
          <Badge variant="outline" className="gap-1 font-normal justify-self-end">
            <ShieldUserIcon aria-hidden />
            System
          </Badge>
        ) : (
          <div className="flex items-center gap-1 justify-self-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                    aria-label={`Edit ${role.name}`}
                    onClick={() => onEdit?.(role)}
                  >
                    <PencilIcon aria-hidden />
                  </Button>
                }
              />
              <TooltipContent>Edit role</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer text-destructive hover:text-destructive"
                    aria-label={`Delete ${role.name}`}
                    onClick={() => onDelete?.(role)}
                  >
                    <Trash2Icon aria-hidden />
                  </Button>
                }
              />
              <TooltipContent>Delete role</TooltipContent>
            </Tooltip>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="cursor-pointer"
                aria-label="View permissions"
                onClick={() => onView(role)}
              >
                <EyeIcon aria-hidden />
              </Button>
            }
          />
          <TooltipContent>View permissions</TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

function RoleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-full" />
      ))}
    </div>
  );
}

function RoleGrid({
  roles,
  emptyLabel,
  onView,
  onEdit,
  onDelete,
}: {
  roles: RoleSummary[];
  emptyLabel: string;
  onView: (role: RoleSummary) => void;
  onEdit?: (role: RoleSummary) => void;
  onDelete?: (role: RoleSummary) => void;
}) {
  if (roles.length === 0) {
    return (
      <Card className="py-2">
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <ShieldIcon className="size-8" aria-hidden />
            <p>{emptyLabel}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export function RolesGrid({
  tenant,
  activeTab,
  onTabChange,
  roles: initialRoles,
  permissions,
}: {
  tenant: string;
  activeTab: RoleTab;
  onTabChange: (tab: RoleTab) => void;
  roles: RoleSummary[];
  permissions: Permission[];
}) {
  const [roles, setRoles] = React.useState(initialRoles);
  const [syncedRoles, setSyncedRoles] = React.useState(initialRoles);
  if (syncedRoles !== initialRoles) {
    setSyncedRoles(initialRoles);
    setRoles(initialRoles);
  }

  const [selectedTab, setSelectedTab] = React.useState(activeTab);
  const [syncedTab, setSyncedTab] = React.useState(activeTab);
  if (syncedTab !== activeTab) {
    setSyncedTab(activeTab);
    setSelectedTab(activeTab);
  }
  const switching = selectedTab !== activeTab;

  function handleTabChange(tab: RoleTab) {
    setSelectedTab(tab);
    onTabChange(tab);
  }

  const [creating, setCreating] = React.useState(false);
  const [viewingRole, setViewingRole] = React.useState<RoleSummary | null>(null);
  const [editingRole, setEditingRole] = React.useState<RoleSummary | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<RoleSummary | null>(null);
  const remove = useDeleteRole(tenant);

  const totalPermissions = permissions.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & Permissions"
        description="What each role can see and do. System roles can't be removed."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Role
          </Button>
        }
      />

      <SectionCards
        loading={switching}
        stats={[
          { label: "Roles", value: String(roles.length) },
          { label: "Total permissions", value: String(totalPermissions) },
        ]}
      />

      <Tabs
        value={selectedTab}
        onValueChange={(value) => value && handleTabChange(value as RoleTab)}
      >
        <TabsList>
          <TabsTrigger value="system">System roles</TabsTrigger>
          <TabsTrigger value="custom">Custom roles</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="mt-4">
          {selectedTab === "system" &&
            (switching ? (
              <RoleGridSkeleton />
            ) : (
              <RoleGrid
                roles={roles}
                emptyLabel="No system roles found."
                onView={setViewingRole}
              />
            ))}
        </TabsContent>
        <TabsContent value="custom" className="mt-4">
          {selectedTab === "custom" &&
            (switching ? (
              <RoleGridSkeleton />
            ) : (
              <RoleGrid
                roles={roles}
                emptyLabel="No custom roles yet. add one for this hotel."
                onView={setViewingRole}
                onEdit={setEditingRole}
                onDelete={setPendingDelete}
              />
            ))}
        </TabsContent>
      </Tabs>

      <RolePermissionsDialog
        tenant={tenant}
        role={viewingRole}
        open={viewingRole !== null}
        onOpenChange={(open) => !open && setViewingRole(null)}
      />

      <RoleFormDialog
        tenant={tenant}
        permissions={permissions}
        open={creating}
        onOpenChange={setCreating}
        onSaved={(created) => {
          if (selectedTab === "custom") {
            setRoles((prev) => [...prev, created]);
          }
        }}
      />

      <RoleFormDialog
        tenant={tenant}
        permissions={permissions}
        role={editingRole ?? undefined}
        open={editingRole !== null}
        onOpenChange={(open) => !open && setEditingRole(null)}
        onSaved={(updated) => {
          setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        }}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Roles still assigned to staff can&apos;t be
              deleted — reassign them first.
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
                setRoles((prev) => prev.filter((r) => r.id !== pendingDelete.id));
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
