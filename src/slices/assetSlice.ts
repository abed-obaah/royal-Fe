import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Asset, AssetState, CreateAssetData, UpdateAssetData, BulkCreateAssetData, UpdatePriceData } from '../types/asset';
import api from '../services/axios';

// Async thunks
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (params: { page?: number; per_page?: number; search?: string; genre?: string; type?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/assets', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

export const fetchAsset = createAsyncThunk(
  'assets/fetchAsset',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/assets/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset');
    }
  }
);

export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (assetData: CreateAssetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/assets', assetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create asset');
    }
  }
);

export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, assetData }: { id: number; assetData: UpdateAssetData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/assets/${id}`, assetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset');
    }
  }
);

export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/assets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete asset');
    }
  }
);

export const bulkCreateAssets = createAsyncThunk(
  'assets/bulkCreateAssets',
  async (bulkData: BulkCreateAssetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/assets/bulk/create', bulkData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create assets in bulk');
    }
  }
);

export const updateAssetPrice = createAsyncThunk(
  'assets/updateAssetPrice',
  async ({ id, priceData }: { id: number; priceData: UpdatePriceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/assets/${id}/update-price`, priceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset price');
    }
  }
);

export const buyAssetShares = createAsyncThunk(
  'assets/buyAssetShares',
  async ({ id, shares }: { id: number; shares: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/assets/${id}/buy`, { shares: shares }); // ✅ Correct field name
      return {
        ...response.data,
        assetId: id,
        sharesPurchased: shares
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to buy asset shares');
    }
  }
);

const initialState: AssetState = {
  assets: [],
  loading: false,
  error: null,
  buyLoading: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  },
};

const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAssets: (state) => {
      state.assets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assets
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.assets = action.payload.data || action.payload;
        state.pagination = {
          current_page: action.payload.current_page || 1,
          last_page: action.payload.last_page || 1,
          per_page: action.payload.per_page || 15,
          total: action.payload.total || action.payload.length,
        };
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single asset
      .addCase(fetchAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        const index = state.assets.findIndex(asset => asset.id === action.payload.id);
        if (index !== -1) {
          state.assets[index] = action.payload;
        } else {
          state.assets.push(action.payload);
        }
      })
      // Create asset
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        state.loading = false;
        state.assets.push(action.payload);
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update asset
      .addCase(updateAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        const index = state.assets.findIndex(asset => asset.id === action.payload.id);
        if (index !== -1) {
          state.assets[index] = action.payload;
        }
      })
      // Delete asset
      .addCase(deleteAsset.fulfilled, (state, action: PayloadAction<number>) => {
        state.assets = state.assets.filter(asset => asset.id !== action.payload);
      })
      // Bulk create assets
      .addCase(bulkCreateAssets.fulfilled, (state, action: PayloadAction<{ assets: Asset[] }>) => {
        state.assets.push(...action.payload.assets);
      })
      // Buy asset shares
      .addCase(buyAssetShares.pending, (state) => {
        state.buyLoading = true;
      })
      .addCase(buyAssetShares.fulfilled, (state, action) => {
        state.buyLoading = false;
        // Update the asset's available shares
        const assetIndex = state.assets.findIndex(asset => asset.id === action.payload.assetId);
        if (assetIndex !== -1) {
          state.assets[assetIndex].available_shares -= action.payload.sharesPurchased;
        }
      })
      .addCase(buyAssetShares.rejected, (state) => {
        state.buyLoading = false;
      });
  },
});

export const { clearError, clearAssets } = assetSlice.actions;
export default assetSlice.reducer;