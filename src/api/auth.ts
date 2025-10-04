// src/api/auth.ts
import api from "../services/axios";

// -------------------- Register --------------------
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  country?: string; // Optional
}

export interface RegisterResponse {
  success: boolean;
  data: {
    message: string; // Added this field
    user: {
      id: number;
      name: string;
      email: string;
      is_admin: boolean;
      created_at: string;
      updated_at: string;
      // Removed email_verified_at since it's not in the response
    };
    // Removed token field since it's not returned during registration
  };
}

export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("register", userData);
  return response.data;
};

// -------------------- Login --------------------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      is_admin: boolean;
      created_at: string;
      updated_at: string;
      email_verified_at: string | null;
    };
    token: string;
  };
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("login", credentials);
  return response.data;
};

// -------------------- Verify Email --------------------
export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  data: {
    message: string;
    user: {
      id: number;
      name: string;
      email: string;
      is_admin: boolean;
      created_at: string;
      updated_at: string;
      email_verified_at: string;
    };
    token: string; // Token should be returned after successful verification
  };
}

export const verifyEmail = async (verificationData: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  const response = await api.post<VerifyEmailResponse>("verify-email", verificationData);
  return response.data;
};

// -------------------- Resend Verification --------------------
export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export const resendVerification = async (emailData: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
  const response = await api.post<ResendVerificationResponse>("resend-verification", emailData);
  return response.data;
};