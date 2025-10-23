import api from "../services/axios";

// -------------------- Royalty Interfaces --------------------
export interface RoyaltyEarning {
  id: number;
  user_id: number;
  portfolio_item_id: number;
  asset_id: number;
  asset_type: 'single' | 'basket';
  amount: number;
  royalty_rate: number;
  period: string;
  status: 'pending' | 'processed' | 'cancelled';
  type: 'streaming' | 'sales' | 'performance' | 'mechanical';
  description: string;
  metadata: any;
  processed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  asset?: {
    id: number;
    title: string;
    artist: string;
    type: 'single' | 'basket';
  };
}

export interface RoyaltySummary {
  total_earned: number;
  pending_earnings: number;
  total_earnings_count: number;
  earnings_by_asset?: Array<{
    asset_id: number;
    total_earnings: number;
    asset: {
      id: number;
      title: string;
      artist: string;
    };
  }>;
  recent_earnings?: RoyaltyEarning[];
}

export interface RoyaltyStatistics {
  total_royalties: number;
  pending_royalties: number;
  processed_royalties: number;
  total_earnings_count: number;
  average_earning: number;
}

export interface RoyaltiesResponse {
  royalties: RoyaltyEarning[];
  statistics: RoyaltySummary;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface GetRoyaltiesParams {
  status?: 'pending' | 'processed' | 'cancelled';
  period?: string;
  type?: 'streaming' | 'sales' | 'performance' | 'mechanical';
  per_page?: number;
  page?: number;
}

// -------------------- API Functions --------------------
export const getRoyaltySummary = async (): Promise<RoyaltySummary> => {
  const response = await api.get<RoyaltySummary>('/royalties/summary');
  return response.data;
};

export const getUserRoyalties = async (params?: GetRoyaltiesParams): Promise<RoyaltiesResponse> => {
  const response = await api.get<RoyaltiesResponse>('/royalties', { params });
  return response.data;
};

export const getRoyaltyStatistics = async (params?: {
  period?: string;
  asset_id?: number;
}): Promise<{ statistics: RoyaltyStatistics }> => {
  const response = await api.get<{ statistics: RoyaltyStatistics }>('/admin/royalties/statistics', { params });
  return response.data;
};

// Admin functions (if needed in future)
export const distributeRoyalties = async (assetId: number, data: {
  total_amount: number;
  period: string;
  royalty_rate: number;
  type: 'streaming' | 'sales' | 'performance' | 'mechanical';
  description: string;
  auto_process?: boolean;
}): Promise<{
  message: string;
  total_distributed: number;
  total_royalty_pool: number;
  investors_count: number;
}> => {
  const response = await api.post(`/admin/royalties/distribute/${assetId}`, data);
  return response.data;
};

export const processPendingRoyalties = async (data?: {
  earning_ids?: number[];
  period?: string;
  user_id?: number;
}): Promise<{
  message: string;
  processed_count: number;
  total_amount: number;
  failed_count: number;
}> => {
  const response = await api.post('/admin/royalties/process-pending', data);
  return response.data;
};