export type Notification = {
  id: string;
  hotelId: string;
  type: string;
  title: string;
  subtitle?: string;
  read: boolean;
  createdAt: string;
};

export type ListNotificationsResponse = {
  notifications: Notification[];
  page: number;
  limit: number;
  total: number;
};
