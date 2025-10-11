import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/axios';

export interface NetworkWallet {
  id: number;
  network: string;
  wallet_address: string;
  qr_code?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNetworkWalletData {
  network: string;
  wallet_address: string;
  qr_code?: string;
  notes?: string;
}

export interface UpdateNetworkWalletData {
  wallet_address?: string;
  qr_code?: string;
  is_active?: boolean;
  notes?: string;
}

export interface NetworkWalletState {
  wallets: NetworkWallet[];
  loading: boolean;
  error: string | null;
  currentWallet: NetworkWallet | null;
}

// Async thunks
export const fetchNetworkWallets = createAsyncThunk(
  'networkWallets/fetchNetworkWallets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/network-wallets');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch network wallets');
    }
  }
);

export const createNetworkWallet = createAsyncThunk(
  'networkWallets/createNetworkWallet',
  async (walletData: CreateNetworkWalletData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/network-wallets', walletData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create network wallet');
    }
  }
);

export const updateNetworkWallet = createAsyncThunk(
  'networkWallets/updateNetworkWallet',
  async ({ id, walletData }: { id: number; walletData: UpdateNetworkWalletData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/network-wallets/${id}`, walletData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update network wallet');
    }
  }
);

export const deleteNetworkWallet = createAsyncThunk(
  'networkWallets/deleteNetworkWallet',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/network-wallets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete network wallet');
    }
  }
);

const initialState: NetworkWalletState = {
  wallets: [],
  loading: false,
  error: null,
  currentWallet: null,
};

const networkWalletSlice = createSlice({
  name: 'networkWallets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentWallet: (state) => {
      state.currentWallet = null;
    },
    setCurrentWallet: (state, action: PayloadAction<NetworkWallet>) => {
      state.currentWallet = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all wallets
      .addCase(fetchNetworkWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetworkWallets.fulfilled, (state, action: PayloadAction<{ wallets: NetworkWallet[] }>) => {
        state.loading = false;
        state.wallets = action.payload.wallets;
      })
      .addCase(fetchNetworkWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create wallet
      .addCase(createNetworkWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNetworkWallet.fulfilled, (state, action: PayloadAction<{ wallet: NetworkWallet }>) => {
        state.loading = false;
        state.wallets.push(action.payload.wallet);
      })
      .addCase(createNetworkWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update wallet
      .addCase(updateNetworkWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNetworkWallet.fulfilled, (state, action: PayloadAction<{ wallet: NetworkWallet }>) => {
        state.loading = false;
        const updatedWallet = action.payload.wallet;
        const index = state.wallets.findIndex(w => w.id === updatedWallet.id);
        if (index !== -1) {
          state.wallets[index] = updatedWallet;
        }
        if (state.currentWallet?.id === updatedWallet.id) {
          state.currentWallet = updatedWallet;
        }
      })
      .addCase(updateNetworkWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete wallet
      .addCase(deleteNetworkWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNetworkWallet.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.wallets = state.wallets.filter(w => w.id !== action.payload);
        if (state.currentWallet?.id === action.payload) {
          state.currentWallet = null;
        }
      })
      .addCase(deleteNetworkWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentWallet, setCurrentWallet } = networkWalletSlice.actions;
export default networkWalletSlice.reducer;