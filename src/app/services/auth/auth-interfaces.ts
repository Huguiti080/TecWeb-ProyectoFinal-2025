// src/app/services/auth/auth-interfaces.ts
export interface AppUser {
  fullName: string;  // Hacer obligatorio
  username?: string;
  email?: string;
  uid?: string;
  // Añade cualquier otra propiedad que necesites
}