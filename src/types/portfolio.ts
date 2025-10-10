import { Asset } from "./asset";

export interface Portfolio {
  id: number;
  user_id: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  items: PortfolioItem[];
}

export interface PortfolioItem {
  id: number;
  portfolio_id: number;
  asset_id: number;
  asset_type: 'single' | 'basket';
  purchase_price: number;
  current_price: number;
  quantity: number;
  current_value: number;
  created_at: string;
  updated_at: string;
  asset?: Asset;
}

export interface Order {
  id: number;
  user_id: number;
  portfolio_id: number;
  asset_id: number;
  asset_type: 'single' | 'basket';
  order_type: 'buy' | 'sell';
  price: number;
  quantity: number;
  total: number;
  status: string;
  reference: string;
  meta?: any;
  created_at: string;
  updated_at: string;
}

export interface BuyAssetData {
  asset_id: number;
  asset_type: 'single' | 'basket';
  quantity?: number;
}

export interface SellAssetData {
  portfolio_item_id: number;
  quantity?: number;
}

export interface PortfolioState {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
}