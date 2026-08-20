export type ReservationStatus = "confirmed" | "seated" | "completed" | "cancelled" | "no_show";

export type ReservationResourceRef = {
  id: string;
  name: string;
};

export type Reservation = {
  id: string;
  hotelId: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedAt: string;
  reservedBy: string;
  reservedByName: string;
  status: ReservationStatus;
  notes?: string;
  tables: ReservationResourceRef[];
  cabins: ReservationResourceRef[];
  createdAt: string;
  updatedAt: string;
};

export type CreateReservationInput = {
  tableIds?: string[];
  cabinIds?: string[];
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedAt: string;
  notes?: string;
};

export type UpdateReservationInput = Partial<CreateReservationInput>;

export type ListReservationsResponse = {
  reservations: Reservation[];
  page: number;
  limit: number;
  total: number;
};
