import type { RoomStatus } from "@/types";

export type Room = {
  id: string;
  hotelId: string;
  roomTypeId: string;
  number: string;
  floor: number;
  status: RoomStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateRoomInput = {
  roomTypeId: string;
  number: string;
  floor: number;
};

export type UpdateRoomInput = Partial<CreateRoomInput>;

export type ListRoomsResponse = {
  rooms: Room[];
  page: number;
  limit: number;
  total: number;
};
