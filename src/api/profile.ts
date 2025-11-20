// services/api/profile.ts
import api from "../services/axios";
export interface Profile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role: string;
  twofa_enabled: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  remember_token?: string | null;
  verification?: Verification;
}

export interface Verification {
  id: number;
  user_id: number;
  id_front: string | null;
  id_back: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  reason: string | null;
  id_front_base64: string | null;
  id_back_base64: string | null;
  created_at: string;
  updated_at: string;
}

export interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
}

export interface ProfileResponse {
  user: Profile;
  verification_status: string;
  twofa_enabled: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateContactRequest {
  email: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UploadIdRequest {
  id_front: string;
  id_back: string;
}

export interface Enable2FARequest {
  code: string;
}

export interface Disable2FARequest {
  password: string;
}

export interface DeleteAccountRequest {
  password: string;
}

interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
  qr_code_image_url: string;
  message: string;
}

interface Enable2FAResponse {
  message: string;
  backup_codes?: string[];
}

interface Enable2FARequest {
  code: string;
}

interface Disable2FARequest {
  password: string;
}

export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>("/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<{ message: string; user: Profile }> => {
    const response = await api.put("/profile", data);
    return response.data;
  },

  updateContactInfo: async (data: UpdateContactRequest): Promise<{ message: string; user: Profile }> => {
    const response = await api.put("/profile/contact", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put("/profile/password", data);
    return response.data;
  },

  uploadIdVerification: async (data: UploadIdRequest): Promise<{ message: string; verification: Verification }> => {
    const response = await api.post("/profile/upload-id", data);
    return response.data;
  },

  getVerificationStatus: async (): Promise<{ verification: Verification | null }> => {
    const response = await api.get("/profile/verification-status");
    return response.data;
  },

  generateTwoFactorSecret: async (): Promise<TwoFactorSetup> => {
    const response = await api.post("/2fa/generate");
    return response.data;
  },

  enableTwoFactor: async (data: Enable2FARequest): Promise<{ message: string }> => {
    const response = await api.post("/2fa/enable", data);
    return response.data;
  },

  disableTwoFactor: async (data: Disable2FARequest): Promise<{ message: string }> => {
    const response = await api.post("/2fa/disable", data);
    return response.data;
  },

  deleteAccount: async (data: DeleteAccountRequest): Promise<{ message: string }> => {
    const response = await api.delete("/account", { data });
    return response.data;
  },
};