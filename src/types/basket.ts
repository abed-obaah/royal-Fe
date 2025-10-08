import { Song } from './song';

export interface Basket {
  id: number;
  name: string;
  price: number;
  risk_rating?: string;
  expected_roi_range?: string;
  roi_to_date?: number;
  image?: string;
  songs: Song[];
  created_at?: string;
  updated_at?: string;
}

export interface BasketState {
  baskets: Basket[];
  loading: boolean;
  error: string | null;
}

export interface CreateBasketData {
  name: string;
  price: number;
  risk_rating?: string;
  expected_roi_range?: string;
  songs: number[];
  image_base64?: string;
}

export interface UpdateBasketData {
  price?: number;
  risk_rating?: string;
  expected_roi_range?: string;
  roi_to_date?: number;
  image_base64?: string;
}