"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { HotelFormDialog } from "./hotel-form-dialog";

export function CreateHotelDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        data-icon="inline-start"
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <PlusIcon aria-hidden />
        New hotel
      </Button>
      <HotelFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
