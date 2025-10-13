import api from "../services/axios";

// -------------------- Profile Types --------------------
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
}

export interface Verification {
  id: number;
  user_id: number;
  id_front: string | null;
  id_back: string | null;
  status: 'pending' | 'approved' | 'rejected';
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

// -------------------- Profile Responses --------------------
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
  id_front: string; // base64
  id_back: string; // base64
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

// -------------------- Profile API Calls --------------------
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>("/profile");
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<{ message: string; user: Profile }> => {
    const response = await api.put("/profile", data);
    return response.data;
  },

  // Update contact info
  updateContactInfo: async (data: UpdateContactRequest): Promise<{ message: string; user: Profile }> => {
    const response = await api.put("/profile/contact", data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put("/profile/password", data);
    return response.data;
  },

  // Upload ID verification
  uploadIdVerification: async (data: UploadIdRequest): Promise<{ message: string; verification: Verification }> => {
    const response = await api.post("/profile/upload-id", data);
    return response.data;
  },

  // Get verification status
  getVerificationStatus: async (): Promise<{ verification: Verification | null }> => {
    const response = await api.get("/profile/verification-status");
    return response.data;
  },

  // Generate 2FA secret
  generateTwoFactorSecret: async (): Promise<TwoFactorSetup> => {
    const response = await api.post("/2fa/generate");
    return response.data;
  },

  // Enable 2FA
  enableTwoFactor: async (data: Enable2FARequest): Promise<{ message: string }> => {
    const response = await api.post("/2fa/enable", data);
    return response.data;
  },

  // Disable 2FA
  disableTwoFactor: async (data: Disable2FARequest): Promise<{ message: string }> => {
    const response = await api.post("/2fa/disable", data);
    return response.data;
  },

  // Delete account
  deleteAccount: async (data: DeleteAccountRequest): Promise<{ message: string }> => {
    const response = await api.delete("/account", { data });
    return response.data;
  },
};