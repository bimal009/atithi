export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: string;
  absoluteExpiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
};

export type AuthSession = {
  user: AuthUser;
  session: Session;
};

export type UpdateProfileInput = {
  name: string;
  email: string;
  image?: string;
};