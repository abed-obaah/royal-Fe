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

// -------------------- Referral Admin Types --------------------
export interface ReferredUser {
  id: number;
  name: string;
  email: string;
  joined_at: string;
  has_invested: boolean;
  investment_amount: number;
  referrer: {
    id: number;
    name: string;
    email: string;
    referral_code: string;
    is_eligible: boolean;
  } | null;
  earnings: {
    total: number;
    pending: number;
    paid: number;
    formatted: {
      total: string;
      pending: string;
      paid: string;
    };
  };
  status: 'active_investor' | 'registered';
}

export interface ReferredUsersResponse {
  referred_users: {
    data: ReferredUser[];
    current_page: number;
    last_page: number;
    total: number;
  };
  statistics: {
    total_referred_users: number;
    active_investors: number;
    total_commission_paid: number;
    total_commission_pending: number;
  };
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

  // Get all referred users with their referrers
  getAllReferredUsers: async (params?: {
    referrer_id?: number;
    referrer_search?: string;
    referred_search?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<ReferredUsersResponse> => {
    const response = await api.get<ReferredUsersResponse>("/admin/referrals/users", { params });
    return response.data;
  },

  // Get referral earnings (for admin view)
  getReferralEarnings: async (params?: {
    referrer_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get("/admin/referral-earnings", { params });
    return response.data;
  },
};