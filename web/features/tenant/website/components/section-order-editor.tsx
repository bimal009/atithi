"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  HOME_SECTION_LABELS,
  homeSectionOrder,
  isSectionEnabled,
  type HomeSectionId,
  type SiteContent,
} from "../types";

const TOGGLEABLE: Partial<Record<HomeSectionId, "rooms" | "cabins" | "testimonials">> = {
  rooms: "rooms",
  cabins: "cabins",
  testimonials: "testimonials",
};

function Row({
  id,
  label,
  enabled,
  onToggle,
}: {
  id: HomeSectionId;
  label: string;
  enabled?: boolean;
  onToggle?: (checked: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2",
        isDragging && "z-10 shadow-md",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex cursor-grab touch-none items-center text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <span className="flex-1 text-sm">{label}</span>
      {onToggle && <Switch checked={enabled} onCheckedChange={onToggle} />}
    </div>
  );
}

export function SectionOrderEditor({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (patch: Partial<SiteContent>) => void;
}) {
  const order = homeSectionOrder(content);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as HomeSectionId);
    const newIndex = order.indexOf(over.id as HomeSectionId);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...order];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, active.id as HomeSectionId);
    onChange({ sectionOrder: next });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1.5">
          {order.map((id) => {
            const toggleKey = TOGGLEABLE[id];
            return (
              <Row
                key={id}
                id={id}
                label={HOME_SECTION_LABELS[id]}
                enabled={toggleKey ? isSectionEnabled(content, toggleKey) : undefined}
                onToggle={
                  toggleKey
                    ? (checked) =>
                        onChange({ enabledSections: { ...content.enabledSections, [toggleKey]: checked } })
                    : undefined
                }
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
