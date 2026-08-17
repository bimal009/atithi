import { z } from "zod";

export const roomSchema = z.object({
  roomTypeId: z.string().min(1, "Select a room type"),
  number: z.string().trim().min(1, "Enter a room number").max(20),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or higher"),
});

export type RoomInput = z.input<typeof roomSchema>;
export type RoomValues = z.output<typeof roomSchema>;
