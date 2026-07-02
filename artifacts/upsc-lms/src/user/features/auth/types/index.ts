// Auth feature types
// Re-export shared User type for convenience
export type { User } from "@/shared/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  targetYear?: number;
}
