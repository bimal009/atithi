export type Permission = {
  id: string;
  resource: string;
  action: string;
  description?: string;
};

export type RoleSummary = {
  id: string;
  hotelId: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Role = RoleSummary & {
  permissions: Permission[];
};

export type ListRolesResponse = {
  roles: RoleSummary[];
};

export type ListPermissionsResponse = {
  permissions: Permission[];
};

export type CreateRoleInput = {
  name: string;
  description?: string;
  permissionIds: string[];
};

export type UpdateRoleInput = {
  name?: string;
  description?: string;
  permissionIds?: string[];
};

export type RoleTab = "system" | "custom";
