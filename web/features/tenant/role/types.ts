export type Permission = {
  id: string;
  resource: string;
  action: string;
  description?: string;
};

export type Role = {
  id: string;
  hotelId: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  memberCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type ListRolesResponse = {
  roles: Role[];
};
