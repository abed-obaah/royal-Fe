import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/axios';

// Types
export interface PortfolioItem {
  id: number;
  portfolio_id: number;
  asset_id: number;
  quantity: number;
  purchase_price: number;
  current_price: number;
  current_value: number;
  asset?: {
    id: number;
    title: string;
    artist: string;
    image_url: string;
    type: string;
    risk_rating: string;
  };
}

export interface Portfolio {
  id: number;
  user_id: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  items: PortfolioItem[];
}

export interface PortfolioState {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetchPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio');
    }
  }
);

export const fetchPortfolioItem = createAsyncThunk(
  'portfolio/fetchPortfolioItem',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/portfolio/items/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio item');
    }
  }
);

const initialState: PortfolioState = {
  portfolio: null,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPortfolio: (state) => {
      state.portfolio = null;
    },
    updatePortfolioItem: (state, action: PayloadAction<PortfolioItem>) => {
      if (state.portfolio) {
        const index = state.portfolio.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.portfolio.items[index] = action.payload;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.portfolio = action.payload.portfolio || action.payload.data || action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch portfolio item
      .addCase(fetchPortfolioItem.fulfilled, (state, action: PayloadAction<any>) => {
        const itemData = action.payload.item || action.payload.data || action.payload;
        if (state.portfolio) {
          const index = state.portfolio.items.findIndex(item => item.id === itemData.id);
          if (index !== -1) {
            state.portfolio.items[index] = itemData;
          }
        }
      });
  },
});

export const { clearError, clearPortfolio, updatePortfolioItem } = portfolioSlice.actions;
export default portfolioSlice.reducer;