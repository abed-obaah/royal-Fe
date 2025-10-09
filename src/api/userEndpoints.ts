import api from "../services/axios";
import { User, Wallet } from '../types/user';

export const userApi = {
  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },

  // Get user wallet
  getWallet: async (): Promise<Wallet> => {
    const response = await api.get('/wallet');
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings: any): Promise<User> => {
    const response = await api.put('/user/settings', settings);
    return response.data;
  },

  // Verify email
  verifyEmail: async (verificationCode: string): Promise<{ message: string }> => {
    const response = await api.post('/email/verify', { code: verificationCode });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (): Promise<{ message: string }> => {
    const response = await api.post('/email/verification-notification');
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> => {
    const response = await api.put('/user/password', passwordData);
    return response.data;
  },
};