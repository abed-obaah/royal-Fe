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

// Legacy Login Response (for backward compatibility)
export interface LegacyLoginResponse {
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

// New 2FA Login Responses
export interface Login2FARequiredResponse {
  message: string;
  twofa_required: true;
  temp_token: string;
  user_id: number;
}

export interface LoginSuccessResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    email_verified_at: string | null;
    twofa_enabled?: boolean;
  };
  twofa_required: false;
}

export type LoginResponse2FA = Login2FARequiredResponse | LoginSuccessResponse;

// Unified login function that handles both response formats
export const login = async (credentials: LoginRequest): Promise<LoginResponse2FA | LegacyLoginResponse> => {
  const response = await api.post("login", credentials);
  return response.data;
};

// Helper function to check if response is 2FA required
export const is2FARequired = (response: any): response is Login2FARequiredResponse => {
  return response && response.twofa_required === true;
};

// Helper function to check if response is legacy format
export const isLegacyResponse = (response: any): response is LegacyLoginResponse => {
  return response && response.success !== undefined && response.data !== undefined;
};

// Helper function to check if response is successful login (new format)
export const isLoginSuccess = (response: any): response is LoginSuccessResponse => {
  return response && response.twofa_required === false && response.token !== undefined;
};

// -------------------- 2FA Verification --------------------
export interface Verify2FALoginRequest {
  temp_token: string;
  code: string;
}

export interface Verify2FALoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    email_verified_at: string | null;
    twofa_enabled?: boolean;
  };
}

export const verify2FALogin = async (data: Verify2FALoginRequest): Promise<Verify2FALoginResponse> => {
  const response = await api.post<Verify2FALoginResponse>("verify-2fa-login", data);
  return response.data;
};

// -------------------- Backup Code Login --------------------
export interface VerifyBackupCodeRequest {
  temp_token: string;
  backup_code: string;
}

export interface VerifyBackupCodeResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    email_verified_at: string | null;
    twofa_enabled?: boolean;
  };
  remaining_backup_codes: number;
}

export const verifyBackupCodeLogin = async (data: VerifyBackupCodeRequest): Promise<VerifyBackupCodeResponse> => {
  const response = await api.post<VerifyBackupCodeResponse>("verify-backup-code-login", data);
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