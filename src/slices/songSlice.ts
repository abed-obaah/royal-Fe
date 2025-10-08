import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Song, SongState, SpotifyTrack } from '../types/song';
import api from '../services/axios';

// Async thunks
export const fetchSongs = createAsyncThunk(
  'songs/fetchSongs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/songs');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch songs');
    }
  }
);

export const createSong = createAsyncThunk(
  'songs/createSong',
  async (songData: FormData | Partial<Song>, { rejectWithValue }) => {
    try {
      const response = await api.post('/songs', songData, {
        headers: songData instanceof FormData ? {
          'Content-Type': 'multipart/form-data',
        } : {},
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create song';
      const errors = error.response?.data?.errors || {};
      return rejectWithValue({ message, errors });
    }
  }
);

export const updateSong = createAsyncThunk(
  'songs/updateSong',
  async ({ id, songData }: { id: number; songData: Partial<Song> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/songs/${id}`, songData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update song');
    }
  }
);

export const deleteSong = createAsyncThunk(
  'songs/deleteSong',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/songs/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete song');
    }
  }
);

export const searchSpotify = createAsyncThunk(
  'songs/searchSpotify',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await api.get('/songs/search/spotify', {
        params: { q: query, limit: 10 }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search Spotify');
    }
  }
);

export const importSpotify = createAsyncThunk(
  'songs/importSpotify',
  async (spotifyId: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/songs/import/spotify', { id: spotifyId });
      return response.data.song;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to import from Spotify');
    }
  }
);

const initialState: SongState = {
  songs: [],
  searchResults: [],
  loading: false,
  error: null,
};

const songSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch songs
      .addCase(fetchSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSongs.fulfilled, (state, action: PayloadAction<Song[]>) => {
        state.loading = false;
        state.songs = action.payload;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create song
      .addCase(createSong.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSong.fulfilled, (state, action: PayloadAction<Song>) => {
        state.loading = false;
        state.songs.push(action.payload);
      })
      .addCase(createSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update song
      .addCase(updateSong.fulfilled, (state, action: PayloadAction<Song>) => {
        const index = state.songs.findIndex(song => song.id === action.payload.id);
        if (index !== -1) {
          state.songs[index] = action.payload;
        }
      })
      // Delete song
      .addCase(deleteSong.fulfilled, (state, action: PayloadAction<number>) => {
        state.songs = state.songs.filter(song => song.id !== action.payload);
      })
      // Search Spotify
      .addCase(searchSpotify.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSpotify.fulfilled, (state, action: PayloadAction<SpotifyTrack[]>) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchSpotify.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Import Spotify
      .addCase(importSpotify.fulfilled, (state, action: PayloadAction<Song>) => {
        state.songs.push(action.payload);
      });
  },
});

export const { clearError, clearSearchResults } = songSlice.actions;
export default songSlice.reducer;