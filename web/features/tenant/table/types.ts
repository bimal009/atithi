import type { RoomStatus } from "@/types";

export type DiningTable = {
  id: string;
  hotelId: string;
  name: string;
  capacity: number;
  sectionId: string;
  status: RoomStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTableInput = {
  name: string;
  capacity: number;
  sectionId: string;
  images?: string[];
};

export type UpdateTableInput = Partial<CreateTableInput>;

export type ListTablesResponse = {
  tables: DiningTable[];
  page: number;
  limit: number;
  total: number;
};
