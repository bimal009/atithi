"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { NepalFlag } from "@/components/shared/nepal-flag";
import { NEPAL_DIAL_CODE, normalizePhoneNumber } from "@/features/auth/schema";
import type { RoleSummary } from "@/features/tenant/role/types";

import { useAddMember } from "../client/useMembers";
import { addMemberSchema, type AddMemberValues } from "../schema";

const emptyValues: AddMemberValues = { phone: "", roleId: "" };

export function AddMemberDialog({
  tenant,
  roles,
}: {
  tenant: string;
  roles: RoleSummary[];
}) {
  const [open, setOpen] = React.useState(false);
  const add = useAddMember(tenant);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: emptyValues,
  });

  const phoneField = register("phone");
  const roleId = watch("roleId");

  const roleItems = React.useMemo(
    () => Object.fromEntries(roles.map((role) => [role.id, role.name])),
    [roles],
  );

  const onSubmit = handleSubmit(async (values) => {
    await add.mutateAsync(values);
    setOpen(false);
    reset(emptyValues);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset(emptyValues);
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" aria-hidden />
        Add Staff
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a staff member</DialogTitle>
            <DialogDescription>
              They need an Atithi account already — enter the phone number they
              signed up with.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] gap-5 overflow-y-auto scrollbar-none py-4">
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="member-phone">Phone number</FieldLabel>
              <InputGroup>
                <InputGroupAddon className="mr-1 border-r border-input py-2 pr-2.5 pl-3">
                  <span className="flex items-center gap-1.5">
                    <NepalFlag className="h-4 w-auto" />
                    <span className="font-medium text-foreground">
                      {NEPAL_DIAL_CODE}
                    </span>
                  </span>
                </InputGroupAddon>
                <InputGroupInput
                  id="member-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  aria-invalid={!!errors.phone}
                  {...phoneField}
                  onChange={(event) => {
                    event.target.value = normalizePhoneNumber(event.target.value);
                    phoneField.onChange(event);
                  }}
                />
              </InputGroup>
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.roleId}>
              <FieldLabel htmlFor="member-role">Role</FieldLabel>
              <Select
                items={roleItems}
                value={roleId}
                onValueChange={(value) =>
                  setValue("roleId", value ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="member-role" className="w-full">
                  <SelectValue placeholder="Select a role" />
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
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={add.isPending}
              data-icon={add.isPending ? "inline-start" : undefined}
            >
              {add.isPending && <Spinner />}
              {add.isPending ? "Adding" : "Add staff member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
