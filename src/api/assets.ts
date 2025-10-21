import api from "../services/axios";

// -------------------- Asset Interfaces --------------------
export interface Asset {
  id: number;
  title: string;
  slug: string;
  type: 'single' | 'basket';
  artist: string | null;
  genre: string | null;
  price: string; // decimal as string
  expected_roi_percent: string | null; // decimal as string
  current_roi_percent: string | null; // decimal as string
  total_shares: number;
  available_shares: number;
   image_base64?: string; // ✅ Add this
  risk_rating?: string;
  image_url: string | null;
  metadata: Record<string, any> | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface AssetsResponse {
  data: Asset[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateAssetRequest {
  title: string;
  slug?: string;
  type: 'single' | 'basket';
  artist?: string;
  genre?: string;
  price: number;
  expected_roi_percent?: number;
  current_roi_percent?: number;
  total_shares: number;
  available_shares?: number;
  image_base64?: string;
  image_filename?: string;
  metadata?: Record<string, any>;
  status?: 'active' | 'inactive';
}

export interface BulkCreateAssetRequest {
  assets: CreateAssetRequest[];
}



export interface BuyAssetResponse {
  message: string;
  details: {
    shares_purchased: number;
    total_invested: string;
    expected_roi: string | null;
    expected_return: string;
  };
}

// -------------------- API Functions --------------------
export const getAssets = async (params?: {
  genre?: string;
  type?: string;
  search?: string;
  page?: number;
}): Promise<AssetsResponse> => {
  const response = await api.get<AssetsResponse>('assets', { params });
  return response.data;
};

export const getAsset = async (id: number): Promise<Asset> => {
  const response = await api.get<Asset>(`assets/${id}`);
  return response.data;
};

export const createAsset = async (assetData: CreateAssetRequest): Promise<Asset> => {
  const response = await api.post<Asset>('assets', assetData);
  return response.data;
};

export const bulkCreateAssets = async (assetsData: BulkCreateAssetRequest): Promise<{
  message: string;
  count: number;
  assets: Asset[];
}> => {
  const response = await api.post<{ message: string; count: number; assets: Asset[] }>(
    'assets/bulk/create',
    assetsData
  );
  return response.data;
};

export const updateAsset = async (id: number, assetData: Partial<CreateAssetRequest>): Promise<Asset> => {
  const response = await api.put<Asset>(`assets/${id}`, assetData);
  return response.data;
};

export const deleteAsset = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`assets/${id}`);
  return response.data;
};

export interface BuyAssetRequest {
  quantity: number;
}

export const buyAsset = async (assetId: number, buyData: BuyAssetRequest): Promise<BuyAssetResponse> => {
  const response = await api.post<BuyAssetResponse>(`assets/${assetId}/buy`, buyData);
  return response.data;
};