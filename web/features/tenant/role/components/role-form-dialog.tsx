"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { useCreateRole, useRoleQuery, useUpdateRole } from "../client/useRoles";
import { roleSchema, type RoleValues } from "../schema";
import type { Permission, Role, RoleSummary } from "../types";

const emptyValues: RoleValues = { name: "", description: "", permissionIds: [] };

function valuesOf(role?: Role): RoleValues {
  if (!role) return emptyValues;
  return {
    name: role.name,
    description: role.description ?? "",
    permissionIds: role.permissions.map((p) => p.id),
  };
}

function groupByResource(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const group = groups.get(permission.resource) ?? [];
    group.push(permission);
    groups.set(permission.resource, group);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function RoleFormDialog({
  tenant,
  permissions,
  role,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  permissions: Permission[];
  role?: RoleSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (role: Role) => void;
}) {
  const isEdit = !!role;
  const create = useCreateRole(tenant);
  const update = useUpdateRole(tenant);
  const roleDetail = useRoleQuery(tenant, role?.id, open && isEdit);
  const pending = isEdit ? update.isPending : create.isPending;
  const loadingDetail = isEdit && roleDetail.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && !roleDetail.data) return;
    reset(valuesOf(roleDetail.data));
  }, [open, isEdit, roleDetail.data, reset]);

  const permissionIds = watch("permissionIds");
  const groups = React.useMemo(() => groupByResource(permissions), [permissions]);

  function togglePermission(id: string) {
    const next = permissionIds.includes(id)
      ? permissionIds.filter((p) => p !== id)
      : [...permissionIds, id];
    setValue("permissionIds", next, { shouldValidate: true });
  }

  function toggleGroup(group: Permission[], checked: boolean) {
    const ids = group.map((p) => p.id);
    const next = checked
      ? Array.from(new Set([...permissionIds, ...ids]))
      : permissionIds.filter((p) => !ids.includes(p));
    setValue("permissionIds", next, { shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      permissionIds: values.permissionIds,
    };

    const response = role
      ? await update.mutateAsync({ id: role.id, input: payload })
      : await create.mutateAsync(payload);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit role" : "Add a role"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this role's name and permissions."
                : "Custom roles are scoped to this hotel only."}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex flex-col gap-5 py-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none py-4">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="role-name">Role name</FieldLabel>
                <Input
                  id="role-name"
                  autoFocus
                  aria-invalid={!!errors.name}
                  {...register("name")}
                  placeholder="Night Manager"
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="role-description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="role-description"
                  aria-invalid={!!errors.description}
                  {...register("description")}
                  placeholder="What this role is responsible for."
                />
                <FieldError errors={[errors.description]} />
              </Field>

              <Field data-invalid={!!errors.permissionIds}>
                <FieldLabel>Permissions</FieldLabel>
                <div className="flex max-h-64 flex-col gap-3 overflow-y-auto scrollbar-none rounded-lg border p-3">
                  {groups.map(([resource, group]) => {
                    const groupIds = group.map((p) => p.id);
                    const allChecked = groupIds.every((id) =>
                      permissionIds.includes(id),
                    );
                    return (
                      <div key={resource} className="flex flex-col gap-1">
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm font-medium capitalize hover:bg-muted">
                          <Checkbox
                            checked={allChecked}
                            onCheckedChange={(checked) =>
                              toggleGroup(group, checked === true)
                            }
                          />
                          {resource}
                        </label>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pl-7">
                          {group.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
                            >
                              <Checkbox
                                checked={permissionIds.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              {permission.action}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <FieldError errors={[errors.permissionIds]} />
              </Field>
            </FieldGroup>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={pending || loadingDetail}
              data-icon={pending ? "inline-start" : undefined}
            >
              {pending && <Spinner />}
              {pending ? "Saving" : isEdit ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
