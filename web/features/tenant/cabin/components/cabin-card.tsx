"use client";

import { ImageOffIcon, PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";

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
import { formatCurrency } from "@/lib/utils";
import type { RoomStatus } from "@/types";

import type { Cabin } from "../types";

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

export function CabinCard({
  cabin,
  billingLabel,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  cabin: Cabin;
  billingLabel: string;
  onEdit: (cabin: Cabin) => void;
  onDelete: (cabin: Cabin) => void;
  onStatusChange: (cabin: Cabin, status: RoomStatus) => void;
}) {
  const maxAmenities = 4;
  const shownAmenities = cabin.amenities.slice(0, maxAmenities);
  const hiddenAmenityCount = cabin.amenities.length - shownAmenities.length;

  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <div className="group/gallery relative h-56 w-full shrink-0 overflow-hidden bg-muted">
        {cabin.images.length > 0 ? (
          <Carousel className="size-full" opts={{ loop: cabin.images.length > 1 }}>
            <CarouselContent className="ml-0 size-full">
              {cabin.images.map((url, index) => (
                <CarouselItem key={`${url}-${index}`} className="relative size-full pl-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
                  <img
                    src={url}
                    alt={`${cabin.name} photo ${index + 1}`}
                    className="size-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {cabin.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 size-7 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
                <CarouselNext className="right-2 size-7 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
                <div className="absolute right-2 bottom-2 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium tabular-nums text-foreground backdrop-blur-sm">
                  {cabin.images.length} photos
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
      </div>

      <CardHeader className="grid-cols-[1fr_auto] pt-4">
        <div>
          <CardTitle>{cabin.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <p className="text-sm text-muted-foreground">Cabin {cabin.number}</p>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button type="button" className="cursor-pointer">
                    <Badge className={`font-normal ${STATUS_BADGE[cabin.status]}`}>
                      {STATUS_LABEL[cabin.status]}
                    </Badge>
                  </button>
                }
              />
              <DropdownMenuContent align="start">
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={status === cabin.status}
                    className="cursor-pointer"
                    onClick={() => onStatusChange(cabin, status)}
                  >
                    {STATUS_LABEL[status]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {cabin.description && (
            <CardDescription className="line-clamp-2">{cabin.description}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-1 justify-self-end">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${cabin.name}`}
                  onClick={() => onEdit(cabin)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit cabin</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Delete ${cabin.name}`}
                  onClick={() => onDelete(cabin)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Delete cabin</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums">
            {formatCurrency(cabin.basePrice)}
          </span>
          <span className="text-xs text-muted-foreground">{billingLabel}</span>
        </div>

        {cabin.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shownAmenities.map((amenity) => (
              <Badge key={amenity} variant="secondary" className="font-normal">
                {amenity}
              </Badge>
            ))}
            {hiddenAmenityCount > 0 && (
              <Badge variant="outline" className="font-normal">
                +{hiddenAmenityCount}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-4 border-t pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UsersIcon className="size-3.5" aria-hidden />
            Sleeps {cabin.capacity}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
