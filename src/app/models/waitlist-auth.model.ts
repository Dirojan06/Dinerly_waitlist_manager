export type UserRole = 'guest' | 'restaurant' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  restaurantId?: number;
  restaurantName?: string;
}


export interface AuthData {
  token: string;
  user: AuthUser;

  restaurantName: string;
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

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}