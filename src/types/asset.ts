import { Song } from './song';
import { Basket } from './basket';

export interface Asset {
  id: number;
  title: string;
  slug: string;
  type: 'single' | 'basket';
  song_id?: number;
  basket_id?: number;
  artist?: string;
  genre?: string;
  price: number;
  expected_roi_percent?: number;
  current_roi_percent?: number;
  total_shares: number;
  available_shares: number;
  image_url?: string;
  metadata?: any;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  song?: Song;
  basket?: Basket;
}

export interface AssetState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
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
  current_roi_percent?: number;
  total_shares: number;
  available_shares?: number;
  image_base64?: string;
  image_filename?: string;
  metadata?: any;
  status?: 'active' | 'inactive';
}

export interface UpdateAssetData {
  title?: string;
  slug?: string;
  type?: 'single' | 'basket';
  song_id?: number;
  basket_id?: number;
  artist?: string;
  genre?: string;
  price?: number;
  expected_roi_percent?: number;
  current_roi_percent?: number;
  total_shares?: number;
  available_shares?: number;
  image_base64?: string;
  image_filename?: string;
  metadata?: any;
  status?: 'active' | 'inactive';
}

export interface BulkCreateAssetData {
  assets: CreateAssetData[];
}

export interface UpdatePriceData {
  roi_percent: number;
}