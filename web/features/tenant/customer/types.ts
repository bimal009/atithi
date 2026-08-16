export type DocumentType =
  | "citizenship"
  | "passport"
  | "driving_license"
  | "voter_id"
  | "national_id";

export type Customer = {
  id: string;
  hotelId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type ListCustomersResponse = {
  customers: Customer[];
  page: number;
  limit: number;
  total: number;
};

export type CreateCustomerInput = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  documentType?: DocumentType;
  documentNumber?: string;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;
