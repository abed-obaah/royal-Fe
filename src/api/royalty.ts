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
    cover_image?: string;
  };
  portfolio_item?: {
    id: number;
    quantity: number;
    current_value: number;
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
      type: 'single' | 'basket';
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

export interface AssetRoyaltyEarnings {
  asset: {
    id: number;
    title: string;
    artist: string;
    type: 'single' | 'basket';
  } | null;
  earnings: RoyaltyEarning[];
  summary: {
    total_earned: number;
    pending_earnings: number;
    total_earnings_count: number;
  };
}

export interface RoyaltyDetails {
  royalty: RoyaltyEarning;
  asset_details: any;
  investment_details: any;
}

// -------------------- API Functions --------------------
export const getRoyaltySummary = async (): Promise<RoyaltySummary> => {
  try {
    const response = await api.get<RoyaltySummary>('/royalties/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching royalty summary:', error);
    throw new Error('Failed to load royalty summary');
  }
};

export const getUserRoyalties = async (params?: GetRoyaltiesParams): Promise<RoyaltiesResponse> => {
  try {
    const response = await api.get<RoyaltiesResponse>('/royalties', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user royalties:', error);
    throw new Error('Failed to load royalty history');
  }
};

export const getRoyaltyDetails = async (royaltyId: number): Promise<RoyaltyDetails> => {
  try {
    const response = await api.get<RoyaltyDetails>(`/royalties/${royaltyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching royalty details:', error);
    throw new Error('Failed to load royalty details');
  }
};

export const getAssetRoyaltyEarnings = async (assetId: number): Promise<AssetRoyaltyEarnings> => {
  try {
    const response = await api.get<AssetRoyaltyEarnings>(`/royalties/assets/${assetId}/earnings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching asset royalty earnings:', error);
    throw new Error('Failed to load asset royalty earnings');
  }
};

export const getRoyaltyStatistics = async (params?: {
  period?: string;
  asset_id?: number;
}): Promise<{ statistics: RoyaltyStatistics }> => {
  try {
    const response = await api.get<{ statistics: RoyaltyStatistics }>('/admin/royalties/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching royalty statistics:', error);
    throw new Error('Failed to load royalty statistics');
  }
};

// Admin functions
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
  try {
    const response = await api.post(`/admin/royalties/distribute/${assetId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error distributing royalties:', error);
    throw new Error('Failed to distribute royalties');
  }
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
  try {
    const response = await api.post('/admin/royalties/process-pending', data);
    return response.data;
  } catch (error) {
    console.error('Error processing pending royalties:', error);
    throw new Error('Failed to process pending royalties');
  }
};

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Utility function to format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};