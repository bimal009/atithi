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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { EntityImageManager } from "@/features/tenant/hotelImages/components/entity-image-manager";

import { useSectionsQuery } from "../../section/client/useSections";
import { useCreateTable, useUpdateTable } from "../client/useTables";
import { tableSchema, type TableInput, type TableValues } from "../schema";
import type { DiningTable } from "../types";

const emptyValues: TableInput = {
  name: "",
  capacity: 2,
  sectionId: "",
};

function valuesOf(table?: DiningTable, defaultSectionId?: string): TableInput {
  if (!table) return { ...emptyValues, sectionId: defaultSectionId ?? "" };
  return {
    name: table.name,
    capacity: table.capacity,
    sectionId: table.sectionId,
  };
}

export function TableFormDialog({
  tenant,
  table,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  table?: DiningTable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (table: DiningTable) => void;
}) {
  const isEdit = !!table;
  const create = useCreateTable(tenant);
  const update = useUpdateTable(tenant);
  const pending = isEdit ? update.isPending : create.isPending;
  const sectionsQuery = useSectionsQuery(tenant, { limit: 100 });
  const sections = React.useMemo(
    () => sectionsQuery.data?.sections ?? [],
    [sectionsQuery.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TableInput, unknown, TableValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: emptyValues,
  });

  const sectionId = watch("sectionId");

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(table, sections[0]?.id));
  }, [open, table, reset, sections]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      capacity: values.capacity,
      sectionId: values.sectionId,
    };

    const response = table
      ? await update.mutateAsync({ id: table.id, input: payload })
      : await create.mutateAsync(payload);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit table" : "Add a table"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this table's seating and section."
                : "New tables start out as available."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field>
              <FieldLabel>Photos</FieldLabel>
              <EntityImageManager
                tenant={tenant}
                entityType="table"
                entityId={table?.id}
                folder="/tables"
                maxCount={3}
              />
              <FieldDescription>JPG, PNG, WebP or AVIF, up to 5 MB each.</FieldDescription>
            </Field>

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="table-name">Table name</FieldLabel>
              <Input
                id="table-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Table 5"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.capacity}>
                <FieldLabel htmlFor="table-capacity">Seats</FieldLabel>
                <Input
                  id="table-capacity"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.capacity}
                  {...register("capacity")}
                />
                <FieldError errors={[errors.capacity]} />
              </Field>
              <Field data-invalid={!!errors.sectionId}>
                <FieldLabel htmlFor="table-section">Section</FieldLabel>
                <Select
                  items={Object.fromEntries(sections.map((s) => [s.id, s.name]))}
                  value={sectionId}
                  onValueChange={(value) =>
                    setValue("sectionId", value ?? "", { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="table-section" className="w-full">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.sectionId]} />
                {sections.length === 0 && (
                  <FieldDescription>
                    No sections yet. Add one under Sections first.
                  </FieldDescription>
                )}
              </Field>
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
              disabled={pending}
              data-icon={pending ? "inline-start" : undefined}
            >
              {pending && <Spinner />}
              {pending ? "Saving" : isEdit ? "Save changes" : "Add table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
