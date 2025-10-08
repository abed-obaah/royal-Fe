import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Basket, BasketState, CreateBasketData, UpdateBasketData } from '../types/basket';
import api from '../services/axios';

// Async thunks
export const fetchBaskets = createAsyncThunk(
  'baskets/fetchBaskets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/baskets');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch baskets');
    }
  }
);

export const createBasket = createAsyncThunk(
  'baskets/createBasket',
  async (basketData: CreateBasketData, { rejectWithValue }) => {
    try {
      const response = await api.post('/baskets', basketData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create basket');
    }
  }
);

export const updateBasket = createAsyncThunk(
  'baskets/updateBasket',
  async ({ id, basketData }: { id: number; basketData: UpdateBasketData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/baskets/${id}`, basketData);
      return response.data.basket;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update basket');
    }
  }
);

export const deleteBasket = createAsyncThunk(
  'baskets/deleteBasket',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/baskets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete basket');
    }
  }
);

export const addSongsToBasket = createAsyncThunk(
  'baskets/addSongsToBasket',
  async ({ basketId, songIds }: { basketId: number; songIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/baskets/${basketId}/add-songs`, { song_ids: songIds });
      return response.data.basket;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add songs to basket');
    }
  }
);

const initialState: BasketState = {
  baskets: [],
  loading: false,
  error: null,
};

const basketSlice = createSlice({
  name: 'baskets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch baskets
      .addCase(fetchBaskets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBaskets.fulfilled, (state, action: PayloadAction<Basket[]>) => {
        state.loading = false;
        state.baskets = action.payload;
      })
      .addCase(fetchBaskets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create basket
      .addCase(createBasket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBasket.fulfilled, (state, action: PayloadAction<Basket>) => {
        state.loading = false;
        state.baskets.push(action.payload);
      })
      .addCase(createBasket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update basket
      .addCase(updateBasket.fulfilled, (state, action: PayloadAction<Basket>) => {
        const index = state.baskets.findIndex(basket => basket.id === action.payload.id);
        if (index !== -1) {
          state.baskets[index] = action.payload;
        }
      })
      // Delete basket
      .addCase(deleteBasket.fulfilled, (state, action: PayloadAction<number>) => {
        state.baskets = state.baskets.filter(basket => basket.id !== action.payload);
      })
      // Add songs to basket
      .addCase(addSongsToBasket.fulfilled, (state, action: PayloadAction<Basket>) => {
        const index = state.baskets.findIndex(basket => basket.id === action.payload.id);
        if (index !== -1) {
          state.baskets[index] = action.payload;
        }
      });
  },
});

export const { clearError } = basketSlice.actions;
export default basketSlice.reducer;