import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Portfolio, PortfolioState, BuyAssetData, SellAssetData } from '../types/portfolio';
import api from '../services/axios';

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

export const buyAsset = createAsyncThunk(
  'portfolio/buyAsset',
  async (buyData: BuyAssetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/portfolio/buy', buyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to buy asset');
    }
  }
);

export const sellAsset = createAsyncThunk(
  'portfolio/sellAsset',
  async (sellData: SellAssetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/portfolio/sell', sellData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sell asset');
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action: PayloadAction<Portfolio>) => {
        state.loading = false;
        state.portfolio = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Buy asset
      .addCase(buyAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyAsset.fulfilled, (state, action: PayloadAction<{ portfolio: Portfolio }>) => {
        state.loading = false;
        state.portfolio = action.payload.portfolio;
      })
      .addCase(buyAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sell asset
      .addCase(sellAsset.fulfilled, (state, action: PayloadAction<{ portfolio: Portfolio }>) => {
        state.portfolio = action.payload.portfolio;
      });
  },
});

export const { clearError, clearPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;