export type UserRole = 'guest' | 'restaurant' | 'admin';

export interface AuthUser {
  id: number;

  name?: string;

  username?: string;

  email: string;

  phone?: string;

  role?: string;

  restaurantId?: number;
}


export interface AuthData {
  token: string;

  user: AuthUser;
}


export interface LoginResponse {
  success: boolean;

  message?: string;

  data: AuthData;
}


export interface RegisterRequest {
  name: string;

  email: string;

  phone: string;

  password: string;
}