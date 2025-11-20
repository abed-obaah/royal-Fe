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
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PendingRoyalty {
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
  user?: {
    id: number;
    name: string;
    email: string;
  };
  asset?: {
    id: number;
    title: string;
    artist: string;
    type: 'single' | 'basket';
    cover_image?: string;
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

export interface PendingRoyaltiesResponse {
  pending_royalties: PendingRoyalty[];
  total_amount: number;
  total_count: number;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ProcessRoyaltiesResponse {
  message: string;
  processed_count: number;
  total_amount: number;
  failed_count: number;
  failed_processes?: Array<{
    earning_id: number;
    error: string;
  }>;
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

// -------------------- ROI/Yield Types --------------------
export interface ROIAssignmentData {
  roi_percentage: number;
  total_yield_amount: number;
  period: string;
  type: 'dividend' | 'yield' | 'interest' | 'roi' | 'manual';
  description: string;
  auto_process?: boolean;
  distribution_method: 'proportional' | 'equal' | 'weighted';
}

export interface ROIAssignmentResponse {
  message: string;
  total_distributed: number;
  total_yield_pool: number;
  remaining_amount: number;
  investors_count: number;
  average_yield_per_investor: number;
  earnings: RoyaltyEarning[];
}

export interface BulkROIAssignmentData {
  assets: Array<{
    asset_id: number;
    roi_percentage: number;
    total_yield_amount: number;
  }>;
  period: string;
  type: 'dividend' | 'yield' | 'interest' | 'roi' | 'manual';
  description: string;
  auto_process?: boolean;
  distribution_method: 'proportional' | 'equal' | 'weighted';
}

export interface BulkROIResponse {
  message: string;
  total_assets_processed: number;
  total_distributed: number;
  results: Array<{
    asset_id: number;
    asset_title?: string;
    success: boolean;
    distributed_amount?: number;
    investors_count?: number;
    error?: string;
  }>;
}

export interface AssetPerformanceMetrics {
  asset: {
    id: number;
    title: string;
    artist: string;
    current_price: number;
    expected_roi_percent: number;
    current_roi_percent: number;
  };
  investment_stats: {
    total_investors: number;
    total_shares: number;
    total_investment_value: number;
    average_investment: number;
  };
  historical_performance: Array<{
    period: string;
    total_roi: number;
    average_roi_percentage: number;
    distribution_count: number;
  }>;
  suggestions: {
    suggested_roi_percentage: number;
    suggested_yield_amount: number;
    recommended_distribution_method: string;
  };
}

export interface ROIStatistics {
  statistics: {
    total_roi_distributed: number;
    total_roi_transactions: number;
    average_roi_per_transaction: number;
    average_roi_percentage: number;
  };
  top_roi_assets: Array<{
    asset_id: number;
    total_roi_distributed: number;
    asset?: {
      id: number;
      title: string;
      artist: string;
      type: 'single' | 'basket';
    };
  }>;
  roi_by_period: Array<{
    period: string;
    total_roi: number;
    transaction_count: number;
    average_roi_percentage: number;
  }>;
}

// -------------------- ROI Assignment & Distribution Interfaces --------------------
interface RoiAssignment {
  id: number;
  asset_id: number;
  roi_percentage: number;
  yield_amount: number;
  period: string;
  type: 'dividend' | 'interest' | 'yield' | 'roi' | 'bonus';
  description: string;
  auto_distribute: boolean;
  processed: boolean;
  processed_at: string | null;
  metadata: any;
  created_by: number;
  created_at: string;
  updated_at: string;
  asset?: Asset;
  distributions?: RoiDistribution[];
}

interface RoiDistribution {
  id: number;
  roi_assignment_id: number;
  user_id: number;
  portfolio_item_id: number;
  asset_id: number;
  shares_owned: number;
  investment_value: number;
  distribution_amount: number;
  roi_percentage: number;
  status: 'pending' | 'processed' | 'failed';
  processed_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  user?: any;
  asset?: Asset;
  assignment?: RoiAssignment;
}

// -------------------- Royalty API Functions --------------------
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

// -------------------- Pending Royalties API Functions --------------------
export const getPendingRoyalties = async (params?: {
  period?: string;
  asset_id?: number;
  user_id?: number;
  per_page?: number;
  page?: number;
}): Promise<PendingRoyaltiesResponse> => {
  try {
    console.log('Fetching pending royalties with params:', params);
    
    const response = await api.get('/admin/royalties/pending', { params });
    
    console.log('Pending royalties API response:', response);
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pending royalties:');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    throw new Error('Failed to load pending royalties');
  }
};

export const processPendingRoyalties = async (data?: {
  earning_ids?: number[];
  period?: string;
  user_id?: number;
}): Promise<ProcessRoyaltiesResponse> => {
  try {
    const response = await api.post('/admin/royalties/process-pending', data);
    return response.data;
  } catch (error) {
    console.error('Error processing pending royalties:', error);
    throw new Error('Failed to process pending royalties');
  }
};

export const processSingleRoyalty = async (earningId: number): Promise<{
  message: string;
  transaction_id: number;
  amount: number;
}> => {
  try {
    const response = await api.post(`/admin/royalties/${earningId}/process`);
    return response.data;
  } catch (error) {
    console.error('Error processing single royalty:', error);
    throw new Error('Failed to process royalty');
  }
};

export const cancelRoyalties = async (earningIds: number[], reason: string): Promise<{
  message: string;
  cancelled_count: number;
}> => {
  try {
    const response = await api.post('/admin/royalties/cancel', {
      earning_ids: earningIds,
      reason: reason
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling royalties:', error);
    throw new Error('Failed to cancel royalties');
  }
};

// -------------------- Admin Royalty Functions --------------------
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

// -------------------- ROI/Yield API Functions --------------------
export const assignManualROI = async (assetId: number, data: ROIAssignmentData): Promise<ROIAssignmentResponse> => {
  try {
    const response = await api.post(`/admin/roi/assets/${assetId}/assign-roi`, data);
    return response.data;
  } catch (error) {
    console.error('Error assigning manual ROI:', error);
    throw new Error('Failed to assign ROI');
  }
};

export const bulkAssignROI = async (data: BulkROIAssignmentData): Promise<BulkROIResponse> => {
  try {
    const response = await api.post('/admin/roi/bulk-assign', data);
    return response.data;
  } catch (error) {
    console.error('Error in bulk ROI assignment:', error);
    throw new Error('Failed to bulk assign ROI');
  }
};

export const getROIStatistics = async (params?: {
  period?: string;
  asset_id?: number;
}): Promise<ROIStatistics> => {
  try {
    const response = await api.get('/admin/roi/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching ROI statistics:', error);
    throw new Error('Failed to load ROI statistics');
  }
};

export const getAssetPerformanceMetrics = async (assetId: number): Promise<AssetPerformanceMetrics> => {
  try {
    const response = await api.get(`/admin/roi/assets/${assetId}/performance-metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching asset performance metrics:', error);
    throw new Error('Failed to load asset performance metrics');
  }
};

// -------------------- ROI Assignment API --------------------
export const createRoiAssignment = async (data: {
  asset_id: number;
  roi_percentage: number;
  yield_amount: number;
  period: string;
  type: 'dividend' | 'interest' | 'yield' | 'roi' | 'bonus';
  description: string;
  auto_distribute?: boolean;
}): Promise<{
  message: string;
  assignment: RoiAssignment;
}> => {
  try {
    const response = await api.post('/admin/roi/assignments', data);
    return response.data;
  } catch (error) {
    console.error('Error creating ROI assignment:', error);
    throw new Error('Failed to create ROI assignment');
  }
};

export const getRoiAssignments = async (params?: {
  asset_id?: number;
  period?: string;
  processed?: boolean;
  per_page?: number;
}): Promise<{
  assignments: RoiAssignment[];
  pagination: any;
}> => {
  try {
    const response = await api.get('/admin/roi/assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching ROI assignments:', error);
    throw new Error('Failed to load ROI assignments');
  }
};

export const processRoiDistribution = async (assignmentId: number): Promise<{
  message: string;
  processed_count: number;
  total_amount: number;
  failed_count: number;
}> => {
  try {
    const response = await api.post(`/admin/roi/assignments/${assignmentId}/process`);
    return response.data;
  } catch (error) {
    console.error('Error processing ROI distribution:', error);
    throw new Error('Failed to process ROI distribution');
  }
};

export const getRoiStatistics = async (params?: {
  period?: string;
  asset_id?: number;
}): Promise<{
  statistics: {
    total_yield: number;
    processed_yield: number;
    pending_yield: number;
    total_assignments: number;
    average_yield: number;
  };
  top_assets: any[];
  monthly_breakdown: any[];
}> => {
  try {
    const response = await api.get('/admin/roi/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching ROI statistics:', error);
    throw new Error('Failed to load ROI statistics');
  }
};

// -------------------- Utility Functions --------------------
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};