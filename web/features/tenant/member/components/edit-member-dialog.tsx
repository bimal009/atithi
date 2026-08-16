"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Role } from "@/features/tenant/role/types";

import { useUpdateMember } from "../client/useMembers";
import { updateMemberSchema, type UpdateMemberValues } from "../schema";
import type { Member } from "../types";

const STATUS_ITEMS = { active: "Active", inactive: "Inactive" };

export function EditMemberDialog({
  tenant,
  member,
  roles,
  open,
  onOpenChange,
}: {
  tenant: string;
  member: Member | null;
  roles: Role[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateMember(tenant);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateMemberValues>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: { roleId: "", status: "active" },
  });

  React.useEffect(() => {
    if (!open || !member) return;
    reset({ roleId: member.roleId, status: member.status });
  }, [open, member, reset]);

  const roleId = watch("roleId");
  const status = watch("status");

  const roleItems = React.useMemo(
    () => Object.fromEntries(roles.map((role) => [role.id, role.name])),
    [roles],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!member) return;
    await update.mutateAsync({ id: member.id, input: values });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Edit {member?.userName}</DialogTitle>
            <DialogDescription>Change their role or access.</DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 py-4">
            <Field data-invalid={!!errors.roleId}>
              <FieldLabel htmlFor="edit-member-role">Role</FieldLabel>
              <Select
                items={roleItems}
                value={roleId}
                onValueChange={(value) =>
                  setValue("roleId", value ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="edit-member-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.roleId]} />
            </Field>

            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="edit-member-status">Status</FieldLabel>
              <Select
                items={STATUS_ITEMS}
                value={status}
                onValueChange={(value) =>
                  setValue(
                    "status",
                    (value ?? "active") as UpdateMemberValues["status"],
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger id="edit-member-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.status]} />
            </Field>
          </FieldGroup>

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
              disabled={update.isPending}
              data-icon={update.isPending ? "inline-start" : undefined}
            >
              {update.isPending && <Spinner />}
              {update.isPending ? "Saving" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
