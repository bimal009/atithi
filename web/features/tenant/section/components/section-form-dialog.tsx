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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { useCreateSection, useUpdateSection } from "../client/useSections";
import { sectionSchema, type SectionInput, type SectionValues } from "../schema";
import type { Section } from "../types";

const emptyValues: SectionInput = { name: "" };

function valuesOf(section?: Section): SectionInput {
  if (!section) return emptyValues;
  return { name: section.name };
}

export function SectionFormDialog({
  tenant,
  section,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  section?: Section;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (section: Section) => void;
}) {
  const isEdit = !!section;
  const create = useCreateSection(tenant);
  const update = useUpdateSection(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionInput, unknown, SectionValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(section));
  }, [open, section, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const response = section
      ? await update.mutateAsync({ id: section.id, input: values })
      : await create.mutateAsync(values);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit section" : "Add a section"}</DialogTitle>
            <DialogDescription>
              A seating area tables can belong to, such as &quot;Indoor&quot; or &quot;Rooftop&quot;.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="section-name">Name</FieldLabel>
              <Input
                id="section-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Rooftop"
              />
              <FieldError errors={[errors.name]} />
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
