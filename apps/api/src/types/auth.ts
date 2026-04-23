export type UserRole = "patient" | "doctor" | "admin" | "reviewer";

export interface AuthUser {
  userId: string;
  role: UserRole;
}
