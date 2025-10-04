// src/api/wallet.ts
import api from "../services/axios";

// -------------------- Wallet Interfaces --------------------
export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface WalletResponse {
  success: boolean;
  data: Wallet[];
}

// -------------------- Deposit Interfaces --------------------
export interface CreateDepositRequest {
  amount: number;
  currency: string;
}

export interface Deposit {
  id: number;
  user_id: number;
  amount: number;
  method_details: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepositResponse {
  success: boolean;
  data: Deposit;
}

// -------------------- Withdraw Interfaces --------------------
export interface CreateWithdrawRequest {
  amount: number;
  currency: string;
  destination: Record<string, any>; // Flexible structure
}

export interface Withdraw {
  id: number;
  user_id: number;
  amount: number;
  method_details: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWithdrawResponse {
  success: boolean;
  data: Withdraw;
}

// -------------------- API Functions --------------------
export const getWallet = async (): Promise<Wallet[]> => {
  const response = await api.get<Wallet[]>('wallet');
  return response.data;
};

export const createDeposit = async (depositData: CreateDepositRequest): Promise<Deposit> => {
  const response = await api.post<Deposit>('wallet/deposit', depositData);
  return response.data;
};

export const createWithdraw = async (withdrawData: CreateWithdrawRequest): Promise<Withdraw> => {
  const response = await api.post<Withdraw>('wallet/withdraw', withdrawData);
  return response.data;
};
