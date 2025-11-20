export interface Song {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  pivot?: {
    basket_id: number;
    song_id: number;
    weight: number;
    created_at: string;
    updated_at: string;
  };
}

export interface Basket {
  id: number;
  name: string;
  image: string | null;
  price: string;
  risk_rating: string | null;
  expected_roi_range: string | null;
  roi_to_date: string | null;
  songs?: Song[];
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  title: string;
  slug: string;
  type: 'single' | 'basket';
  song_id: number | null;
  basket_id: number | null;
  artist: string | null;
  genre: string | null;
  price: string;
  expected_roi_percent: string | null;
  expected_roi_min: string | null;
  expected_roi_max: string | null;
  current_roi_percent: string | null;
  total_shares: number;
  available_shares: number;
  image_base64?: string;
  risk_rating?: 'low' | 'medium' | 'high';
  // risk_rating?: string;
  image_url: string | null;
  metadata: Record<string, any> | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  
  // Relationships
  song?: Song;
  basket?: Basket;
}

export interface AssetsResponse {
  data: Asset[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateAssetData {
  title: string;
  slug?: string;
  type: 'single' | 'basket';
  song_id?: number;
  basket_id?: number;
  artist?: string;
  genre?: string;
  price: number;
  expected_roi_percent?: number;
  expected_roi_min?: number;
  expected_roi_max?: number;
  current_roi_percent?: number;
  total_shares: number;
  available_shares?: number;
  image_base64?: string;
  image_url?: string;
  metadata?: Record<string, any>;
  status?: 'active' | 'inactive';
  risk_rating?: 'low' | 'medium' | 'high';
}

export interface UpdateAssetData extends Partial<CreateAssetData> {}

export interface BulkCreateAssetData {
  assets: CreateAssetData[];
}

export interface UpdatePriceData {
  price: number;
}

export interface AssetState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  buyLoading: boolean;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}