"use client";

import * as React from "react";
import {
  MoreHorizontalIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDeleteRole } from "../client/useRoles";
import type { Permission, Role } from "../types";
import { RoleFormDialog } from "./role-form-dialog";

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}) {
  const resources = Array.from(new Set(role.permissions.map((p) => p.resource))).sort();

  return (
    <Card>
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>{role.name}</CardTitle>
          {role.description && <CardDescription>{role.description}</CardDescription>}
        </div>
        {role.isSystem ? (
          <Badge variant="outline" className="gap-1 font-normal">
            <ShieldUserIcon aria-hidden />
            System
          </Badge>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer justify-self-end"
                  aria-label={`Actions for ${role.name}`}
                >
                  <MoreHorizontalIcon aria-hidden />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit?.(role)}>
                <PencilIcon aria-hidden />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => onDelete?.(role)}
              >
                <Trash2Icon aria-hidden />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {resources.map((resource) => (
            <Badge key={resource} variant="secondary" className="font-normal capitalize">
              {resource}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <span>{role.permissions.length} permissions</span>
          <span>
            {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleGrid({
  roles,
  emptyLabel,
  onEdit,
  onDelete,
}: {
  roles: Role[];
  emptyLabel: string;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
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
        <RoleCard key={role.id} role={role} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export function RolesGrid({
  tenant,
  systemRoles,
  hotelRoles,
  permissions,
}: {
  tenant: string;
  systemRoles: Role[];
  hotelRoles: Role[];
  permissions: Permission[];
}) {
  const [creating, setCreating] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Role | null>(null);
  const remove = useDeleteRole(tenant);

  const allRoles = [...systemRoles, ...hotelRoles];
  const totalMembers = allRoles.reduce((sum, r) => sum + r.memberCount, 0);
  const totalPermissions = new Set(
    allRoles.flatMap((r) => r.permissions.map((p) => p.id)),
  ).size;

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
        stats={[
          { label: "Roles", value: String(allRoles.length) },
          { label: "Staff assigned", value: String(totalMembers) },
          { label: "Distinct permissions", value: String(totalPermissions) },
        ]}
      />

      <Tabs defaultValue="system">
        <TabsList>
          <TabsTrigger value="system">System roles ({systemRoles.length})</TabsTrigger>
          <TabsTrigger value="custom">Custom roles ({hotelRoles.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="mt-4">
          <RoleGrid roles={systemRoles} emptyLabel="No system roles found." />
        </TabsContent>
        <TabsContent value="custom" className="mt-4">
          <RoleGrid
            roles={hotelRoles}
            emptyLabel="No custom roles yet. add one for this hotel."
            onEdit={setEditingRole}
            onDelete={setPendingDelete}
          />
        </TabsContent>
      </Tabs>

      <RoleFormDialog
        tenant={tenant}
        permissions={permissions}
        open={creating}
        onOpenChange={setCreating}
      />

      <RoleFormDialog
        tenant={tenant}
        permissions={permissions}
        role={editingRole ?? undefined}
        open={editingRole !== null}
        onOpenChange={(open) => !open && setEditingRole(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && pendingDelete.memberCount > 0
                ? `${pendingDelete.memberCount} staff ${pendingDelete.memberCount === 1 ? "member holds" : "members hold"} this role — reassign them first.`
                : "This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              disabled={remove.isPending || (pendingDelete?.memberCount ?? 0) > 0}
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
