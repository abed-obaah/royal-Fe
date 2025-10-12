import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/axios';

interface Order {
  id: number;
  user_id: number;
  portfolio_id: number;
  asset_id: number;
  asset_type: string;
  order_type: 'buy' | 'sell';
  price: string;
  quantity: number;
  total: string;
  status: 'pending' | 'completed' | 'rejected';
  reference: string;
  meta: any;
  created_at: string;
  updated_at: string;
  asset?: {
    id: number;
    title: string;
    artist: string;
    price: string;
    type: string;
    image_base64: string;
    available_shares: number;
    expected_roi_percent: string;
    current_roi_percent: string;
  };
}

interface PortfolioItem {
  id: number;
  portfolio_id: number;
  asset_id: number;
  asset_type: string;
  purchase_price: string;
  current_price: string;
  quantity: number;
  current_value: string;
  asset?: {
    id: number;
    title: string;
    artist: string;
    price: string;
    type: string;
    image_base64: string;
    available_shares: number;
  };
}

interface Portfolio {
  id: number;
  user_id: number;
  total_value: string;
  items: PortfolioItem[];
}

interface OrderPagination {
  orders: Order[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  summary: {
    total_orders: number;
    buy_orders: number;
    sell_orders: number;
    completed_orders: number;
    pending_orders: number;
  };
}

interface OrderState {
  portfolio: Portfolio | null;
  sellOrders: Order[];
  pendingSellOrders: Order[];
  orderHistory: Order[];
  currentOrder: Order | null;
  orderPagination: OrderPagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  portfolio: null,
  sellOrders: [],
  pendingSellOrders: [],
  orderHistory: [],
  currentOrder: null,
  orderPagination: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchPortfolio = createAsyncThunk(
  'order/fetchPortfolio',
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
  'order/buyAsset',
  async ({ asset_id, quantity }: { asset_id: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/portfolio/buy', { asset_id, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to buy asset');
    }
  }
);

export const sellAsset = createAsyncThunk(
  'order/sellAsset',
  async ({ portfolio_item_id, quantity }: { portfolio_item_id: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/portfolio/sell', { portfolio_item_id, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sell asset');
    }
  }
);

export const fetchSellOrders = createAsyncThunk(
  'order/fetchSellOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio/sell-orders');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sell orders');
    }
  }
);

export const fetchPendingSellOrders = createAsyncThunk(
  'order/fetchPendingSellOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/sell/pending');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending orders');
    }
  }
);

export const approveSellOrder = createAsyncThunk(
  'order/approveSellOrder',
  async ({ order_id, action }: { order_id: number; action: 'approve' | 'reject' }, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/sell/approve', { order_id, action });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process sell order');
    }
  }
);

// Order History thunks
export const fetchOrderHistory = createAsyncThunk(
  'order/fetchOrderHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio/orders/history');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order history');
    }
  }
);

export const fetchOrdersPaginated = createAsyncThunk(
  'order/fetchOrdersPaginated',
  async (params: { per_page?: number; order_type?: string; status?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio/orders', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/portfolio/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOrders: (state) => {
      state.sellOrders = [];
      state.pendingSellOrders = [];
      state.orderHistory = [];
      state.orderPagination = null;
      state.currentOrder = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrderHistory: (state) => {
      state.orderHistory = [];
      state.orderPagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Portfolio
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
      // Buy Asset
      .addCase(buyAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload.portfolio;
      })
      .addCase(buyAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sell Asset
      .addCase(sellAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sellAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload.portfolio;
      })
      .addCase(sellAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Sell Orders
      .addCase(fetchSellOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.sellOrders = action.payload;
      })
      .addCase(fetchSellOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Pending Sell Orders
      .addCase(fetchPendingSellOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingSellOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.pendingSellOrders = action.payload;
      })
      .addCase(fetchPendingSellOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Approve Sell Order
      .addCase(approveSellOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveSellOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the approved/rejected order from pending list
        state.pendingSellOrders = state.pendingSellOrders.filter(
          order => order.id !== action.payload.order.id
        );
      })
      .addCase(approveSellOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Order History
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action: PayloadAction<{ orders: Order[] }>) => {
        state.loading = false;
        state.orderHistory = action.payload.orders;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Orders Paginated
      .addCase(fetchOrdersPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersPaginated.fulfilled, (state, action: PayloadAction<OrderPagination>) => {
        state.loading = false;
        state.orderPagination = action.payload;
      })
      .addCase(fetchOrdersPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action: PayloadAction<{ order: Order }>) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  resetOrders, 
  clearCurrentOrder, 
  clearOrderHistory 
} = orderSlice.actions;

export default orderSlice.reducer;