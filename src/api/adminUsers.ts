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
  last_login_at: string;
  registered: string;
  is_online?: boolean;
  password?: string; // Added password field
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
  password?: string; // Added password field
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

export interface DeleteUserResponse {
  message: string;
  deleted_user_id: number;
}

export interface UserPasswordResponse {
  password: string;
}

// -------------------- Admin Users API --------------------
export const adminUsersApi = {
  // Get all users with optional filters
  getUsers: async (filters?: any): Promise<UsersResponse> => {
    try {
      console.log('Fetching users with filters:', filters);
      const response = await api.get<UsersResponse>("/admin/users", { params: filters });
      console.log('Users fetched successfully:', response.data.users.length, 'users found');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user details
  getUserDetails: async (userId: number): Promise<UserDetails> => {
    try {
      console.log(`Fetching details for user ${userId}`);
      const response = await api.get<UserDetails>(`/admin/users/${userId}`);
      console.log(`User ${userId} details fetched successfully`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching user ${userId} details:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user password
  getUserPassword: async (userId: number): Promise<UserPasswordResponse> => {
    try {
      console.log(`Fetching password for user ${userId}`);
      const response = await api.get<UserPasswordResponse>(`/admin/users/${userId}/password`);
      console.log(`User ${userId} password fetched successfully`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching password for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user investments
  getUserInvestments: async (userId: number): Promise<InvestmentsResponse> => {
    try {
      const response = await api.get<InvestmentsResponse>(`/admin/users/${userId}/investments`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching user ${userId} investments:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId: number, data: {
    name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
  }): Promise<{ user: AdminUser; message: string }> => {
    try {
      const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/profile`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating user ${userId} profile:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Reset user password
  resetUserPassword: async (userId: number, data: {
    password: string;
    password_confirmation: string;
    notify_user: boolean;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.put<{ message: string }>(`/admin/users/${userId}/password`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error resetting password for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Verify user email
  verifyUserEmail: async (userId: number): Promise<{ user: AdminUser; message: string }> => {
    try {
      const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/verify-email`);
      return response.data;
    } catch (error: any) {
      console.error(`Error verifying email for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user plain text password
getUserPasswordPlain: async (userId: number): Promise<UserPasswordResponse> => {
  try {
    console.log(`Fetching plain text password for user ${userId}`);
    const response = await api.get<UserPasswordResponse>(`/admin/users/${userId}/password-plain`);
    console.log(`User ${userId} plain text password fetched successfully`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching plain text password for user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
},


  // Unverify user email
  unverifyUserEmail: async (userId: number): Promise<{ user: AdminUser; message: string }> => {
    try {
      const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/unverify-email`);
      return response.data;
    } catch (error: any) {
      console.error(`Error unverifying email for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId: number, data: {
    status: string;
    reason: string;
  }): Promise<{ user: AdminUser; message: string }> => {
    try {
      const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/status`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating status for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (userId: number, data: {
    role: string;
    reason: string;
  }): Promise<{ user: AdminUser; message: string }> => {
    try {
      const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/role`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating role for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Credit user wallet
  creditUserWallet: async (userId: number, data: {
    amount: number;
    reason: string;
    reference: string;
  }): Promise<{ message: string; new_balance: number }> => {
    try {
      const response = await api.post<{ message: string; new_balance: number }>(`/admin/users/${userId}/wallet/credit`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error crediting wallet for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Debit user wallet
  debitUserWallet: async (userId: number, data: {
    amount: number;
    reason: string;
    reference: string;
  }): Promise<{ message: string; new_balance: number }> => {
    try {
      const response = await api.post<{ message: string; new_balance: number }>(`/admin/users/${userId}/wallet/debit`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error debiting wallet for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Update user wallet balances directly
  updateUserWallet: async (userId: number, data: {
    available_balance: number;
    invested_balance: number;
    reason: string;
  }): Promise<WalletUpdateResponse> => {
    try {
      const response = await api.put<WalletUpdateResponse>(`/admin/users/${userId}/wallet`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating wallet for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Reset user wallet to zero
  resetUserWallet: async (userId: number, data: {
    reason: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.put<{ message: string }>(`/admin/users/${userId}/wallet/reset`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error resetting wallet for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Revoke investment with refund
  revokeInvestment: async (userId: number, investmentId: number): Promise<{ 
    message: string; 
    refund_amount: number;
    investment_id: number;
  }> => {
    try {
      const response = await api.delete<{ 
        message: string; 
        refund_amount: number;
        investment_id: number;
      }>(`/admin/users/${userId}/investments/${investmentId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error revoking investment ${investmentId} for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Revoke investment without refund
  revokeInvestmentWithoutRefund: async (userId: number, investmentId: number, data: {
    reason: string;
  }): Promise<{ 
    message: string; 
    revoked_amount: number;
    investment_id: number;
  }> => {
    try {
      const response = await api.delete<{ 
        message: string; 
        revoked_amount: number;
        investment_id: number;
      }>(`/admin/users/${userId}/investments/${investmentId}/no-refund`, { data });
      return response.data;
    } catch (error: any) {
      console.error(`Error revoking investment without refund ${investmentId} for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
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
    try {
      const response = await api.post<{ 
        message: string; 
        transferred_investment: UserInvestment;
        from_user_id: number;
        to_user_id: number;
      }>(`/admin/users/${userId}/investments/${investmentId}/transfer`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error transferring investment ${investmentId} from user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Clear user portfolio with refund
  clearUserPortfolio: async (userId: number, data: {
    reason: string;
  }): Promise<PortfolioClearResponse> => {
    try {
      const response = await api.delete<PortfolioClearResponse>(`/admin/users/${userId}/portfolio`, { data });
      return response.data;
    } catch (error: any) {
      console.error(`Error clearing portfolio for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Clear user portfolio without refund
  clearPortfolioWithoutRefund: async (userId: number, data: {
    reason: string;
  }): Promise<PortfolioClearResponse> => {
    try {
      const response = await api.delete<PortfolioClearResponse>(`/admin/users/${userId}/portfolio/no-refund`, { data });
      return response.data;
    } catch (error: any) {
      console.error(`Error clearing portfolio without refund for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete user account
  deleteUser: async (userId: number, data?: {
    reason?: string;
    transfer_investments_to?: number;
    delete_investments?: boolean;
  }): Promise<DeleteUserResponse> => {
    try {
      console.log(`Attempting to delete user ${userId} with data:`, data);
      const response = await api.delete<DeleteUserResponse>(`/admin/users/${userId}`, { data });
      console.log(`Delete user ${userId} successful:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Permanent delete user (force delete)
  forceDeleteUser: async (userId: number): Promise<DeleteUserResponse> => {
    try {
      console.log(`Attempting to force delete user ${userId}`);
      const response = await api.delete<DeleteUserResponse>(`/admin/users/${userId}/force`);
      console.log(`Force delete user ${userId} successful:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error force deleting user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user portfolio
  getUserPortfolio: async (userId: number): Promise<{ portfolio: any[] }> => {
    try {
      const response = await api.get<{ portfolio: any[] }>(`/admin/users/${userId}/portfolio`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching portfolio for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user transactions
  getUserTransactions: async (userId: number, filters?: any): Promise<{ transactions: any[] }> => {
    try {
      const response = await api.get<{ transactions: any[] }>(`/admin/users/${userId}/transactions`, { params: filters });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching transactions for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user stats
  getUserStats: async (userId: number): Promise<any> => {
    try {
      const response = await api.get<any>(`/admin/users/${userId}/stats`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching stats for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user investment details
  getUserInvestmentDetails: async (userId: number): Promise<any> => {
    try {
      const response = await api.get<any>(`/admin/users/${userId}/investment-details`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching investment details for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Basic user update
  updateUser: async (userId: number, data: any): Promise<{ user: AdminUser; message: string }> => {
    try {
      const response = await api.put<{ user: AdminUser; message: string }>(`/admin/users/${userId}/update`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // List users (simple)
  listUsers: async (filters?: any): Promise<UsersResponse> => {
    try {
      const response = await api.get<UsersResponse>("/admin/users/list", { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error listing users:', error.response?.data || error.message);
      throw error;
    }
  },

  // Verify user exists
  verifyUserExists: async (userId: number): Promise<boolean> => {
    try {
      await adminUsersApi.getUserDetails(userId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Debug: Get all user IDs
  debugUserIds: async (): Promise<number[]> => {
    try {
      const users = await adminUsersApi.getUsers();
      const userIds = users.users.map(user => user.id).sort((a, b) => a - b);
      console.log('Available user IDs:', userIds);
      return userIds;
    } catch (error) {
      console.error('Error debugging user IDs:', error);
      return [];
    }
  },
};

// -------------------- Admin Notifications API --------------------
export const adminNotificationsApi = {
  // Send notification to single user
  sendToUser: async (data: SendNotificationRequest): Promise<{ message: string; notification: UserNotification }> => {
    try {
      const response = await api.post("/admin/notifications/send-to-user", data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending notification to user:', error.response?.data || error.message);
      throw error;
    }
  },

  // Send notification to multiple users
  sendToMultiple: async (data: SendNotificationRequest): Promise<{ message: string; sent_count: number; failed_users: number[] }> => {
    try {
      const response = await api.post("/admin/notifications/send-to-multiple", data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending notification to multiple users:', error.response?.data || error.message);
      throw error;
    }
  },

  // Send notification to all users
  sendToAll: async (data: SendNotificationRequest): Promise<{ message: string; total_users: number; sent_count: number }> => {
    try {
      const response = await api.post("/admin/notifications/send-to-all", data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending notification to all users:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user notifications
  getUserNotifications: async (userId: number, filters?: any): Promise<UserNotificationsResponse> => {
    try {
      const response = await api.get(`/admin/notifications/users/${userId}/notifications`, { params: filters });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching notifications for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete user notification
  deleteUserNotification: async (userId: number, notificationId: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/admin/notifications/users/${userId}/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting notification ${notificationId} for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Mark all user notifications as read
  markAllUserNotificationsAsRead: async (userId: number): Promise<{ message: string; marked_count: number }> => {
    try {
      const response = await api.put(`/admin/notifications/users/${userId}/notifications/mark-all-read`);
      return response.data;
    } catch (error: any) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get notification statistics
  getNotificationStats: async (): Promise<NotificationStats> => {
    try {
      const response = await api.get("/admin/notifications/statistics");
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notification stats:', error.response?.data || error.message);
      throw error;
    }
  },
};

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
  total: number;
}

export interface UpdateStatusResponse {
  message: string;
  verification: KYCVerification;
}

// -------------------- KYC API --------------------
export const adminKYCApi = {
  // Get pending verifications
  getPendingVerifications: async (): Promise<KYCResponse> => {
    try {
      const response = await api.get<KYCResponse>("/admin/kyc/pending");
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending KYC verifications:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all verifications
  getAllVerifications: async (filters?: any): Promise<KYCResponse> => {
    try {
      const response = await api.get<KYCResponse>("/admin/kyc/verifications", { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all KYC verifications:', error.response?.data || error.message);
      throw error;
    }
  },

  // Approve verification
  approveVerification: async (verificationId: number): Promise<UpdateStatusResponse> => {
    try {
      const response = await api.put<UpdateStatusResponse>(`/admin/kyc/${verificationId}/approve`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving KYC verification ${verificationId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Reject verification
  rejectVerification: async (verificationId: number, data: { reason: string }): Promise<UpdateStatusResponse> => {
    try {
      const response = await api.put<UpdateStatusResponse>(`/admin/kyc/${verificationId}/reject`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting KYC verification ${verificationId}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

// -------------------- Referral API --------------------
export const adminReferralsApi = {
  // Get all referred users
  getReferredUsers: async (filters?: any): Promise<any> => {
    try {
      const response = await api.get<any>("/admin/referrals/users", { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching referred users:', error.response?.data || error.message);
      throw error;
    }
  },
};

// -------------------- Royalty API --------------------
export const adminRoyaltiesApi = {
  // Get user royalties (admin)
  getUserRoyalties: async (userId: number, filters?: any): Promise<any> => {
    try {
      const response = await api.get<any>(`/admin/royalties/users/${userId}/royalties`, { params: filters });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching royalties for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create manual royalty
  createManualRoyalty: async (userId: number, data: any): Promise<any> => {
    try {
      const response = await api.post<any>(`/admin/royalties/users/${userId}/royalties/manual`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error creating manual royalty for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

// Export default for convenience
export default {
  adminUsersApi,
  adminNotificationsApi,
  adminKYCApi,
  adminReferralsApi,
  adminRoyaltiesApi,
};