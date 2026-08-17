"use client";

import { ImageOffIcon, LayersIcon, PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPricingUnit } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import type { RoomStatus } from "@/types";

import type { RoomType } from "../../roomType/types";
import type { Room } from "../types";

const STATUS_OPTIONS: RoomStatus[] = ["available", "occupied", "cleaning", "maintenance"];

const STATUS_BADGE: Record<RoomStatus, string> = {
  available: "border-primary/30 bg-primary/10 text-primary",
  occupied: "border-muted-foreground/20 bg-muted text-foreground",
  cleaning: "border-secondary bg-secondary text-secondary-foreground",
  maintenance: "border-destructive/30 bg-destructive/10 text-destructive",
};

const STATUS_LABEL: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
};

export function RoomCard({
  room,
  roomType,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  room: Room;
  roomType?: RoomType;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onStatusChange: (room: Room, status: RoomStatus) => void;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <div className="group/gallery relative aspect-[4/3] bg-muted">
        {room.images.length > 0 ? (
          <Carousel className="size-full" opts={{ loop: room.images.length > 1 }}>
            <CarouselContent className="ml-0 size-full">
              {room.images.map((url, index) => (
                <CarouselItem key={`${url}-${index}`} className="relative size-full pl-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                  <img
                    src={url}
                    alt={`Room ${room.number} photo ${index + 1}`}
                    className="size-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {room.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 size-7 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
                <CarouselNext className="right-2 size-7 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
                <div className="absolute right-2 bottom-2 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium tabular-nums text-foreground backdrop-blur-sm">
                  {room.images.length} photos
                </div>
              </>
            )}
          </Carousel>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOffIcon className="size-6" aria-hidden />
            <span className="text-xs">No photos</span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="absolute top-2 left-2 cursor-pointer">
                <Badge className={`font-normal ${STATUS_BADGE[room.status]}`}>
                  {STATUS_LABEL[room.status]}
                </Badge>
              </button>
            }
          />
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === room.status}
                className="cursor-pointer"
                onClick={() => onStatusChange(room, status)}
              >
                {STATUS_LABEL[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="grid-cols-[1fr_auto] pt-4">
        <div>
          <CardTitle>Room {room.number}</CardTitle>
          <p className="text-sm text-muted-foreground">{roomType?.name ?? "Unknown type"}</p>
        </div>
        <div className="flex items-center gap-1 justify-self-end">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit room ${room.number}`}
                  onClick={() => onEdit(room)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit room</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Delete room ${room.number}`}
                  onClick={() => onDelete(room)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Delete room</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums">
            {roomType ? formatCurrency(roomType.basePrice) : "—"}
          </span>
          {roomType && (
            <span className="text-xs text-muted-foreground">
              {formatPricingUnit(roomType.pricingUnit, roomType.pricingLabel)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-4 border-t pt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <LayersIcon className="size-3.5" aria-hidden />
            Floor {room.floor}
          </span>
          {roomType && (
            <span className="flex items-center gap-1.5">
              <UsersIcon className="size-3.5" aria-hidden />
              Sleeps {roomType.capacity}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
