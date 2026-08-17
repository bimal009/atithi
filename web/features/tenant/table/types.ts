import type { RoomStatus, TableSection } from "@/types";

export type DiningTable = {
  id: string;
  hotelId: string;
  name: string;
  capacity: number;
  section: TableSection;
  status: RoomStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTableInput = {
  name: string;
  capacity: number;
  section: TableSection;
  images?: string[];
};

export type UpdateTableInput = Partial<CreateTableInput>;

export type ListTablesResponse = {
  tables: DiningTable[];
  page: number;
  limit: number;
  total: number;
};
