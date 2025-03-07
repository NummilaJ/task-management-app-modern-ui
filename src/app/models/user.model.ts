export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Huom: oikeassa toteutuksessa salasanat salattaisiin backendissä
  role: UserRole;
  createdAt: Date;
  createdBy?: string; // Admin joka loi käyttäjän
} 