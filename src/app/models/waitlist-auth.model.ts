export type UserRole = 'guest' | 'restaurant' | 'admin';

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}