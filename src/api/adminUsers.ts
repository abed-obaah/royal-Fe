import api from "../services/axios";

// -------------------- User Management Types --------------------
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role: string;
  email_verified_at: string | null;
  is_email_verified: boolean;
  verification_status: string;
  wallet_balance: number;
  invested_balance: number;
  total_balance: number;
  last_login: string;
  last_login_at: string | null;
  registered: string;
  registered_at: string;
  orders_count: number;
  transactions_count: number;
}

export interface UserDetails {
  user: AdminUser;
  statistics: any;
  recent_activity: any;
}

export interface UserWallet {
  wallet: any;
  balance_breakdown: {
    available_balance: number;
    invested_balance: number;
    total_balance: number;
  };
}

export interface UserInvestment {
  id: number;
  asset: any;
  portfolio: any;
  purchase_price: number;
  quantity: number;
  current_price: number;
  current_value: number;
  created_at: string;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// -------------------- Request Types --------------------
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  role?: string;
}

export interface ResetPasswordRequest {
  password: string;
  password_confirmation: string;
  notify_user?: boolean;
}

export interface CreditDebitRequest {
  amount: number;
  reason: string;
  reference?: string;
}

export interface StatusUpdateRequest {
  status: string;
  reason?: string;
}

export interface RoleUpdateRequest {
  role: string;
}

// -------------------- Admin Users API Calls --------------------
export const adminUsersApi = {
  // Get all users
  getUsers: async (filters?: any): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>("/admin/users", { params: filters });
    return response.data;
  },

  // Get user details
  getUserDetails: async (userId: number): Promise<UserDetails> => {
    const response = await api.get<UserDetails>(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userId: number, data: UpdateProfileRequest): Promise<{ message: string; user: AdminUser }> => {
    const response = await api.put(`/admin/users/${userId}/profile`, data);
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (userId: number, data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/${userId}/password`, data);
    return response.data;
  },

  // Verify user email
  verifyUserEmail: async (userId: number): Promise<{ message: string; user: AdminUser }> => {
    const response = await api.put(`/admin/users/${userId}/verify-email`);
    return response.data;
  },

  // Unverify user email
  unverifyUserEmail: async (userId: number): Promise<{ message: string; user: AdminUser }> => {
    const response = await api.put(`/admin/users/${userId}/unverify-email`);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: number, data: StatusUpdateRequest): Promise<{ message: string; user: AdminUser }> => {
    const response = await api.put(`/admin/users/${userId}/status`, data);
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: number, data: RoleUpdateRequest): Promise<{ message: string; user: AdminUser }> => {
    const response = await api.put(`/admin/users/${userId}/role`, data);
    return response.data;
  },

  // Get user wallet
  getUserWallet: async (userId: number): Promise<UserWallet> => {
    const response = await api.get<UserWallet>(`/admin/users/${userId}/wallet`);
    return response.data;
  },

  // Credit user wallet
  creditUserWallet: async (userId: number, data: CreditDebitRequest): Promise<any> => {
    const response = await api.post(`/admin/users/${userId}/wallet/credit`, data);
    return response.data;
  },

  // Debit user wallet
  debitUserWallet: async (userId: number, data: CreditDebitRequest): Promise<any> => {
    const response = await api.post(`/admin/users/${userId}/wallet/debit`, data);
    return response.data;
  },

  // Reset user wallet
  resetUserWallet: async (userId: number, data: { reason: string }): Promise<any> => {
    const response = await api.put(`/admin/users/${userId}/wallet/reset`, data);
    return response.data;
  },

  // Get user investments
  getUserInvestments: async (userId: number): Promise<{ investments: UserInvestment[]; total_investment: number; count: number }> => {
    const response = await api.get(`/admin/users/${userId}/investments`);
    return response.data;
  },

  // Get user portfolio
  getUserPortfolio: async (userId: number): Promise<any> => {
    const response = await api.get(`/admin/users/${userId}/portfolio`);
    return response.data;
  },

  // Revoke investment
  revokeInvestment: async (userId: number, investmentId: number): Promise<any> => {
    const response = await api.delete(`/admin/users/${userId}/investments/${investmentId}`);
    return response.data;
  },

  // Clear user portfolio
  clearUserPortfolio: async (userId: number, data: { reason: string }): Promise<any> => {
    const response = await api.delete(`/admin/users/${userId}/portfolio`, { data });
    return response.data;
  },

  // Get user transactions
  getUserTransactions: async (userId: number, filters?: any): Promise<any> => {
    const response = await api.get(`/admin/users/${userId}/transactions`, { params: filters });
    return response.data;
  },

  // Get user statistics
  getUserStats: async (userId: number): Promise<any> => {
    const response = await api.get(`/admin/users/${userId}/stats`);
    return response.data;
  },
};