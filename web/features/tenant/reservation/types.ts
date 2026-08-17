export type ReservationStatus = "confirmed" | "seated" | "completed" | "cancelled" | "no_show";

export type Reservation = {
  id: string;
  hotelId: string;
  tableId: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedAt: string;
  reservedBy: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReservationInput = {
  tableId: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedAt: string;
  reservedBy: string;
  notes?: string;
};

export type UpdateReservationInput = Partial<CreateReservationInput>;

export type ListReservationsResponse = {
  reservations: Reservation[];
  page: number;
  limit: number;
  total: number;
};
