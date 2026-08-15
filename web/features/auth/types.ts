export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  phoneNumber: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  /** False until the user supplies a real name and email. */
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
};

/** Mirrors the API session record. The token stays in the HttpOnly cookie. */
export type Session = {
  id: string;
  userId: string;
  /** Idle deadline. Refreshing pushes it out; past it the session is dead. */
  expiresAt: string;
  /** Hard ceiling. Refreshing never moves it. */
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

export type OnboardingInput = {
  name: string;
  email: string;
  image?: string;
};
