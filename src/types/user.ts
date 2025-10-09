export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
}

export interface Wallet {
  id: number;
  user_id: number;
  available_balance: number;
  invested_balance: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}