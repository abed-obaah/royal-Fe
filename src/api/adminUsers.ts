// src/api/adminUsers.ts
import api from "../services/axios";

// -------------------- User Types --------------------
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  role: string;
  is_email_verified: boolean;
  wallet_balance: number;
  invested_balance: number;
  total_balance: number;
  last_login: string;
  registered: string;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  role: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  statistics?: {
    financial?: {
      total_deposits?: number;
      total_withdrawals?: number;
      total_invested?: number;
      total_earned?: number;
    };
    activity?: {
      total_orders?: number;
      portfolio_items?: number;
      login_count?: number;
      last_active?: string;
    };
  };
}

export interface UserInvestment {
  id: number;
  asset?: {
    id: number;
    title: string;
    symbol?: string;
    image_url?: string;
  };
  quantity: number;
  purchase_price: number;
  current_price: number;
  current_value: number | string;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

// -------------------- Notification Types --------------------
export interface UserNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read_at: string | null;
  created_at: string;
  data?: any;
}

export interface SendNotificationRequest {
  user_id?: number;
  user_ids?: number[];
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  user_type?: 'all' | 'verified' | 'unverified' | 'active' | 'inactive' | 'suspended' | 'investors' | 'non_investors';
}

export interface NotificationStats {
  statistics: {
    total: number;
    unread: number;
    read: number;
    info: number;
    success: number;
    warning: number;
    error: number;
    system: number;
    urgent: number;
    high: number;
  };
  recent_activity: Array<{
    date: string;
    count: number;
  }>;
}

export interface UserNotificationsResponse {
  notifications: UserNotification[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total: number;
    unread: number;
    read: number;
  };
}

// -------------------- API Response Types --------------------
export interface UsersResponse {
  users: AdminUser[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface InvestmentsResponse {
  investments: UserInvestment[];
  total_value: number;
}

export interface SendNotificationResponse {
  message: string;
  sent_count?: number;
  notification_id?: number;
}

export interface WalletUpdateResponse {
  message: string;
  new_balances: {
    available_balance: number;
    invested_balance: number;
    total_balance: number;
  };
}

export interface PortfolioClearResponse {
  message: string;
  total_refund?: number;
  total_value_revoked?: number;
  cleared_investments: number;
}

// -------------------- Admin Users API --------------------
export const adminUsersApi = {
  // Get all users with optional filters
  getUsers: async (filters?: any): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>("/admin/users", { params: filters });
    return response.data;
  },

  // Get user details
  getUserDetails: async (userId: number): Promise<UserDetails> => {
    const response = await api.get<UserDetails>(`/admin/users/${userId}`);
    return response.data;
  },

  // Get user investments
  getUserInvestments: async (userId: number): Promise<InvestmentsResponse> => {
    const response = await api.get<InvestmentsResponse>(`/admin/users/${userId}/investments`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userId: number, data: {
    name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
  }): Promise<{ user: AdminUser; message: string }> => {
    const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/profile`, data);
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (userId: number, data: {
    password: string;
    password_confirmation: string;
    notify_user: boolean;
  }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/admin/users/${userId}/reset-password`, data);
    return response.data;
  },

  // Verify user email
  verifyUserEmail: async (userId: number): Promise<{ user: AdminUser; message: string }> => {
    const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/verify-email`);
    return response.data;
  },

  // Unverify user email
  unverifyUserEmail: async (userId: number): Promise<{ user: AdminUser; message: string }> => {
    const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/unverify-email`);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: number, data: {
    status: string;
    reason: string;
  }): Promise<{ user: AdminUser; message: string }> => {
    const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/status`, data);
    return response.data;
  },

  // Credit user wallet
  creditUserWallet: async (userId: number, data: {
    amount: number;
    reason: string;
    reference: string;
  }): Promise<{ message: string; new_balance: number }> => {
    const response = await api.post<{ message: string; new_balance: number }>(`/admin/users/${userId}/credit`, data);
    return response.data;
  },

  // Debit user wallet
  debitUserWallet: async (userId: number, data: {
    amount: number;
    reason: string;
    reference: string;
  }): Promise<{ message: string; new_balance: number }> => {
    const response = await api.post<{ message: string; new_balance: number }>(`/admin/users/${userId}/debit`, data);
    return response.data;
  },

  // Update user wallet balances directly
  updateUserWallet: async (userId: number, data: {
    available_balance: number;
    invested_balance: number;
    reason: string;
  }): Promise<WalletUpdateResponse> => {
    const response = await api.put<WalletUpdateResponse>(`/admin/users/${userId}/wallet`, data);
    return response.data;
  },

  // Reset user wallet to zero
  resetUserWallet: async (userId: number, data: {
    reason: string;
  }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/admin/users/${userId}/reset-wallet`, data);
    return response.data;
  },

  // Revoke investment with refund
  revokeInvestment: async (userId: number, investmentId: number): Promise<{ 
    message: string; 
    refund_amount: number;
    investment_id: number;
  }> => {
    const response = await api.post<{ 
      message: string; 
      refund_amount: number;
      investment_id: number;
    }>(`/admin/users/${userId}/investments/${investmentId}/revoke`);
    return response.data;
  },

  // Revoke investment without refund
  revokeInvestmentWithoutRefund: async (userId: number, investmentId: number, data: {
    reason: string;
  }): Promise<{ 
    message: string; 
    revoked_amount: number;
    investment_id: number;
  }> => {
    const response = await api.post<{ 
      message: string; 
      revoked_amount: number;
      investment_id: number;
    }>(`/admin/users/${userId}/investments/${investmentId}/revoke-without-refund`, data);
    return response.data;
  },

  // Transfer investment to another user
  transferInvestment: async (userId: number, investmentId: number, data: {
    target_user_id: string;
    reason: string;
  }): Promise<{ 
    message: string; 
    transferred_investment: UserInvestment;
    from_user_id: number;
    to_user_id: number;
  }> => {
    const response = await api.post<{ 
      message: string; 
      transferred_investment: UserInvestment;
      from_user_id: number;
      to_user_id: number;
    }>(`/admin/users/${userId}/investments/${investmentId}/transfer`, data);
    return response.data;
  },

  // Clear user portfolio with refund
  clearUserPortfolio: async (userId: number, data: {
    reason: string;
  }): Promise<PortfolioClearResponse> => {
    const response = await api.post<PortfolioClearResponse>(`/admin/users/${userId}/clear-portfolio`, data);
    return response.data;
  },

  // Clear user portfolio without refund
  clearPortfolioWithoutRefund: async (userId: number, data: {
    reason: string;
  }): Promise<PortfolioClearResponse> => {
    const response = await api.post<PortfolioClearResponse>(`/admin/users/${userId}/clear-portfolio-without-refund`, data);
    return response.data;
  },
};

// -------------------- Admin Notifications API --------------------
export const adminNotificationsApi = {
  // Send notification to single user
  sendToUser: async (data: SendNotificationRequest): Promise<{ message: string; notification: UserNotification }> => {
    const response = await api.post("/admin/notifications/send-to-user", data);
    return response.data;
  },

  // Send notification to multiple users
  sendToMultiple: async (data: SendNotificationRequest): Promise<{ message: string; sent_count: number; failed_users: number[] }> => {
    const response = await api.post("/admin/notifications/send-to-multiple", data);
    return response.data;
  },

  // Send notification to all users
  sendToAll: async (data: SendNotificationRequest): Promise<{ message: string; total_users: number; sent_count: number }> => {
    const response = await api.post("/admin/notifications/send-to-all", data);
    return response.data;
  },

  // Get user notifications
  getUserNotifications: async (userId: number, filters?: any): Promise<UserNotificationsResponse> => {
    const response = await api.get(`/admin/notifications/users/${userId}/notifications`, { params: filters });
    return response.data;
  },

  // Delete user notification
  deleteUserNotification: async (userId: number, notificationId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/notifications/users/${userId}/notifications/${notificationId}`);
    return response.data;
  },

  // Mark all user notifications as read
  markAllUserNotificationsAsRead: async (userId: number): Promise<{ message: string; marked_count: number }> => {
    const response = await api.put(`/admin/notifications/users/${userId}/notifications/mark-all-read`);
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async (): Promise<NotificationStats> => {
    const response = await api.get("/admin/notifications/statistics");
    return response.data;
  },
};

// -------------------- KYC Types (if needed) --------------------
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
  total: number;
}

export interface UpdateStatusResponse {
  message: string;
  verification: KYCVerification;
}

// Export default for convenience
export default {
  adminUsersApi,
  adminNotificationsApi,
};