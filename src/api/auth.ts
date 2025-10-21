// src/api/auth.ts
import api from "../services/axios";

// -------------------- Register --------------------
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  country?: string; // Optional
  referral_code?: string; // Add this line
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  referral_code: string;
  referred_by: boolean;
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
      role: string;
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
      role: string;
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

// -------------------- Verify OTP --------------------
export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  message: string;
}

export const verifyOtp = async (verificationData: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const response = await api.post<VerifyOtpResponse>("verify-otp", verificationData);
  return response.data;
};

// -------------------- Resend OTP --------------------
export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

export const resendOtp = async (emailData: ResendOtpRequest): Promise<ResendOtpResponse> => {
  const response = await api.post<ResendOtpResponse>("resend-otp", emailData);
  return response.data;
};

// -------------------- Referral Check --------------------
export interface ReferralCheckResponse {
  valid: boolean;
  referrer_name: string;
  message: string;
}

export const checkReferralCode = async (code: string): Promise<ReferralCheckResponse> => {
  const response = await api.get<ReferralCheckResponse>(`referral/check/${code}`);
  return response.data;
};