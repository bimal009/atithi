export type MemberStatus = "active" | "inactive";

export type Member = {
  id: string;
  hotelId: string;
  userId: string;
  roleId: string;
  status: MemberStatus;
  invitedBy?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userImage?: string;
  roleName: string;
  roleSlug: string;
};

export type ListMembersResponse = {
  members: Member[];
  page: number;
  limit: number;
  total: number;
};

export type AddMemberInput = {
  phone: string;
  roleId: string;
};

export type UpdateMemberInput = {
  roleId?: string;
  status?: MemberStatus;
};
