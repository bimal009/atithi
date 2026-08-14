export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  phoneNumber: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
};


/** Mirrors the API session record. The token stays in the HttpOnly cookie. */
export type Session = {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
};

export type AuthSession = {
  user: AuthUser;
  session: Session;
};
