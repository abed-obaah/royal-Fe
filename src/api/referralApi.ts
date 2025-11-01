import api from "./axios";

// -------------------- Referral Earnings Types --------------------
export interface ReferralEarning {
  id: number;
  referrer_id: number;
  referred_user_id: number;
  amount: string;
  investment_amount: string;
  type: string;
  status: 'pending' | 'paid' | 'cancelled';
  description: string;
  created_at: string;
  updated_at: string;
  referred_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ReferralEarningsSummary {
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  successful_referrals: number;
  is_eligible: boolean;
  formatted: {
    total_earnings: string;
    pending_earnings: string;
    paid_earnings: string;
  };
}

export interface ReferralEarningsHistory {
  id: number;
  referred_user_name: string;
  referred_user_email: string;
  amount: string;
  investment_amount: string;
  type: string;
  status: string;
  description: string;
  earned_at: string;
  commission_rate: string;
}

export interface ReferralEarningsResponse {
  summary: ReferralEarningsSummary;
  earnings_history: ReferralEarningsHistory[];
}

// -------------------- Referral Earnings API Calls --------------------
export const referralApi = {
  // Get referral earnings summary and history
  getReferralEarnings: async (): Promise<ReferralEarningsResponse> => {
    const response = await api.get<ReferralEarningsResponse>("/referral/earnings");
    return response.data;
  },

  // Get referral info (you might already have this)
  getReferralInfo: async () => {
    const response = await api.get("/referral/info");
    return response.data;
  },
};