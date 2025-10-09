import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Transaction, 
  TransactionState, 
  CreateTransactionData, 
  UpdateTransactionStatusData, 
  UpdateTransactionData,
  TransactionFilters 
} from '../types/transaction';
import api from '../services/axios';

// Async thunks
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData: CreateTransactionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction');
    }
  }
);

export const fetchUserTransactions = createAsyncThunk(
  'transactions/fetchUserTransactions',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/transactions/history', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user transactions');
    }
  }
);

export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAllTransactions',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/transactions', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransaction = createAsyncThunk(
  'transactions/fetchTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

export const updateTransactionStatus = createAsyncThunk(
  'transactions/updateTransactionStatus',
  async ({ id, statusData }: { id: number; statusData: UpdateTransactionStatusData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transactions/${id}/status`, statusData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction status');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transactionData }: { id: number; transactionData: UpdateTransactionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transactions/${id}`, transactionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction');
    }
  }
);

export const uploadProof = createAsyncThunk(
  'transactions/uploadProof',
  async ({ id, proof }: { id: number; proof: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/transactions/${id}/upload-proof`, { proof });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload proof');
    }
  }
);

export const deleteProof = createAsyncThunk(
  'transactions/deleteProof',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/transactions/${id}/proof`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete proof');
    }
  }
);

export const resetUserBalance = createAsyncThunk(
  'transactions/resetUserBalance',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/reset-balance`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset user balance');
    }
  }
);

const initialState: TransactionState = {
  transactions: [],
  userTransactions: [],
  loading: false,
  error: null,
  filters: {},
  summary: {
    total_count: 0,
    total_amount: 0,
    by_status: {},
    by_kind: {},
  },
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
    clearUserTransactions: (state) => {
      state.userTransactions = [];
    },
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<{ transaction: Transaction }>) => {
        state.loading = false;
        state.userTransactions.unshift(action.payload.transaction);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch user transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action: PayloadAction<{ transactions: any }>) => {
        state.loading = false;
        state.userTransactions = action.payload.transactions.data || action.payload.transactions;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all transactions (admin)
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.transactions = action.payload.transactions.data || action.payload.transactions;
        state.summary = action.payload.summary || {
          total_count: 0,
          total_amount: 0,
          by_status: {},
          by_kind: {},
        };
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update transaction status
      .addCase(updateTransactionStatus.fulfilled, (state, action: PayloadAction<{ transaction: Transaction }>) => {
        const updatedTransaction = action.payload.transaction;
        
        // Update in transactions list
        const transactionIndex = state.transactions.findIndex(t => t.id === updatedTransaction.id);
        if (transactionIndex !== -1) {
          state.transactions[transactionIndex] = updatedTransaction;
        }
        
        // Update in user transactions list
        const userTransactionIndex = state.userTransactions.findIndex(t => t.id === updatedTransaction.id);
        if (userTransactionIndex !== -1) {
          state.userTransactions[userTransactionIndex] = updatedTransaction;
        }
      })
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<{ transaction: Transaction }>) => {
        const updatedTransaction = action.payload.transaction;
        
        const transactionIndex = state.transactions.findIndex(t => t.id === updatedTransaction.id);
        if (transactionIndex !== -1) {
          state.transactions[transactionIndex] = updatedTransaction;
        }
        
        const userTransactionIndex = state.userTransactions.findIndex(t => t.id === updatedTransaction.id);
        if (userTransactionIndex !== -1) {
          state.userTransactions[userTransactionIndex] = updatedTransaction;
        }
      })
      // Upload proof
      .addCase(uploadProof.fulfilled, (state, action: PayloadAction<{ transaction: Transaction }>) => {
        const updatedTransaction = action.payload.transaction;
        
        const userTransactionIndex = state.userTransactions.findIndex(t => t.id === updatedTransaction.id);
        if (userTransactionIndex !== -1) {
          state.userTransactions[userTransactionIndex] = updatedTransaction;
        }
      })
      // Delete proof
      .addCase(deleteProof.fulfilled, (state, action: PayloadAction<{ transaction: Transaction }>) => {
        const updatedTransaction = action.payload.transaction;
        
        const userTransactionIndex = state.userTransactions.findIndex(t => t.id === updatedTransaction.id);
        if (userTransactionIndex !== -1) {
          state.userTransactions[userTransactionIndex] = updatedTransaction;
        }
      });
  },
});

export const { 
  clearError, 
  clearTransactions, 
  clearUserTransactions, 
  setFilters, 
  clearFilters 
} = transactionSlice.actions;

export default transactionSlice.reducer;