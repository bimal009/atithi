export type BillingType = {
  id: string;
  hotelId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBillingTypeInput = {
  name: string;
};

export type UpdateBillingTypeInput = Partial<CreateBillingTypeInput>;
