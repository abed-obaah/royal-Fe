import api from "../services/axios";

// -------------------- KYC Types --------------------
export interface KYCVerification {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  id_front: string | null;
  id_back: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface KYCResponse {
  verifications: KYCVerification[];
}

export interface UpdateStatusResponse {
  message: string;
  verification: KYCVerification;
}

// -------------------- Admin API Calls --------------------
export const adminApi = {
  // Get pending KYC verifications
  getPendingVerifications: async (): Promise<KYCResponse> => {
    const response = await api.get<KYCResponse>("/admin/kyc/pending");
    return response.data;
  },

  // Get all KYC verifications
  getAllVerifications: async (): Promise<KYCResponse> => {
    const response = await api.get<KYCResponse>("/admin/kyc/verifications");
    return response.data;
  },

  // Approve verification
  approveVerification: async (verificationId: number): Promise<UpdateStatusResponse> => {
    const response = await api.put<UpdateStatusResponse>(`/admin/kyc/${verificationId}/approve`);
    return response.data;
  },

  // Reject verification
  rejectVerification: async (verificationId: number, reason: string): Promise<UpdateStatusResponse> => {
    const response = await api.put<UpdateStatusResponse>(`/admin/kyc/${verificationId}/reject`, { reason });
    return response.data;
  },
};