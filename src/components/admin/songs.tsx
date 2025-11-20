"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Plus, Pencil, Trash2, Music2, Search, Download, Filter, X } from "lucide-react";
import { 
  fetchSongs, 
  createSong, 
  updateSong, 
  deleteSong, 
  searchSpotify, 
  importSpotify,
  clearSearchResults,
  clearError,
} from "../../slices/songSlice";
import { RootState, AppDispatch } from "../../store";
import { Song, SpotifyTrack } from "../../types/song";

export default function Songs() {
  const dispatch = useDispatch<AppDispatch>();
  const { songs, searchResults, loading, error } = useSelector((state: RootState) => state.songs);
  
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Loading states for different actions
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [importLoading, setImportLoading] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState<number | null>(null);
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    artist: "",
    album: "",
    hasSpotifyId: false,
  });
  
  const [form, setForm] = useState({
    title: "",
    artist: "",
    album: "",
    duration_ms: "",
    image: null as File | null,
    image_url: "",
  });

  useEffect(() => {
    dispatch(fetchSongs());
  }, [dispatch]);

  // Reset loading states when modals close
  useEffect(() => {
    if (!open) setSaveLoading(false);
    if (!deleteOpen) setDeleteLoading(false);
    if (!searchOpen) {
      setSearchLoading(false);
      setImportLoading(null);
    }
  }, [open, deleteOpen, searchOpen]);

  // Filter songs based on filter criteria
  const filteredSongs = songs.filter(song => {
    if (filters.title && !song.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    if (filters.artist && !song.artist?.toLowerCase().includes(filters.artist.toLowerCase())) {
      return false;
    }
    if (filters.album && !song.album?.toLowerCase().includes(filters.album.toLowerCase())) {
      return false;
    }
    if (filters.hasSpotifyId && !song.spotify_id) {
      return false;
    }
    return true;
  });

  // Check if any filters are active
  const hasActiveFilters = filters.title || filters.artist || filters.album || filters.hasSpotifyId;

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      title: "",
      artist: "",
      album: "",
      hasSpotifyId: false,
    });
  };

  // Open Add/Edit Song
  const handleOpen = (song: Song | null = null) => {
    if (song) {
      setForm({
        title: song.title,
        artist: song.artist || "",
        album: song.album || "",
        duration_ms: song.duration_ms?.toString() || "",
        image: null,
        image_url: song.image_url || "",
      });
      setSelectedSong(song);
    } else {
      setForm({
        title: "",
        artist: "",
        album: "",
        duration_ms: "",
        image: null,
        image_url: "",
      });
      setSelectedSong(null);
    }
    setOpen(true);
    dispatch(clearError());
  };

  // Save Song
  const handleSave = async () => {
    if (!form.title.trim()) {
      dispatch({ type: 'songs/createSong/rejected', payload: { message: 'Validation failed', errors: { title: ['The title field is required.'] } } });
      return;
    }

    if (!form.image && !form.image_url.trim()) {
      dispatch({ type: 'songs/createSong/rejected', payload: { message: 'Validation failed', errors: { image: ['Either an image file or image URL must be provided.'] } } });
      return;
    }

    setSaveLoading(true);

    try {
      if (selectedSong) {
        // Update existing song
        await dispatch(updateSong({ 
          id: selectedSong.id, 
          songData: {
            title: form.title,
            artist: form.artist,
            album: form.album,
            duration_ms: form.duration_ms ? parseInt(form.duration_ms) : undefined,
            image_url: form.image_url || undefined,
          }
        })).unwrap();
      } else {
        // Create new song
        if (form.image) {
          const formData = new FormData();
          formData.append('title', form.title);
          formData.append('artist', form.artist);
          formData.append('album', form.album);
          formData.append('duration_ms', form.duration_ms);
          formData.append('image', form.image);
          if (form.image_url) formData.append('image_url', form.image_url);
          await dispatch(createSong(formData)).unwrap();
        } else {
          await dispatch(createSong({
            title: form.title,
            artist: form.artist,
            album: form.album,
            duration_ms: form.duration_ms ? parseInt(form.duration_ms) : undefined,
            image_url: form.image_url,
          })).unwrap();
        }
      }
      setOpen(false);
    } catch (error) {
      // Error is handled by the slice, just keep the modal open
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Song
  const handleDelete = async () => {
    if (selectedSong) {
      setDeleteLoading(true);
      try {
        await dispatch(deleteSong(selectedSong.id)).unwrap();
        setDeleteOpen(false);
      } catch (error) {
        // Error is handled by the slice
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Handle individual edit button click
  const handleEditClick = async (song: Song) => {
    setEditLoading(song.id);
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      handleOpen(song);
    } finally {
      setEditLoading(null);
    }
  };

  // Handle individual delete button click
  const handleDeleteClick = async (song: Song) => {
    setDeleteButtonLoading(song.id);
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      setSelectedSong(song);
      setDeleteOpen(true);
    } finally {
      setDeleteButtonLoading(null);
    }
  };

  // Search Spotify
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setSearchLoading(true);
      try {
        await dispatch(searchSpotify(searchQuery)).unwrap();
      } catch (error) {
        // Error is handled by the slice
      } finally {
        setSearchLoading(false);
      }
    }
  };

  // Import from Spotify
  const handleImport = async (track: SpotifyTrack) => {
    setImportLoading(track.spotify_id);
    try {
      await dispatch(importSpotify(track.spotify_id)).unwrap();
      setSearchOpen(false);
      setSearchQuery("");
      dispatch(clearSearchResults());
    } catch (error) {
      // Error is handled by the slice
    } finally {
      setImportLoading(null);
    }
  };

  // Format duration from milliseconds to minutes:seconds
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  // Render error details - FIXED VERSION
  const renderError = () => {
    if (!error) return null;
    
    // Handle string error
    if (typeof error === 'string') {
      return <div className="mb-4 p-4 bg-red-600 rounded-lg text-white">{error}</div>;
    }
    
    // Handle object error with proper type checking
    const errorObj = error as any;
    
    return (
      <div className="mb-4 p-4 bg-red-600 rounded-lg text-white">
        <p>{errorObj.message || 'An error occurred'}</p>
        {errorObj.errors && Object.keys(errorObj.errors).length > 0 && (
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(errorObj.errors).map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return messageArray.map((msg: any, index: number) => (
                <li key={`${field}-${index}`}>
                  {field === 'image' && typeof msg === 'string' && msg.includes('server error') ? (
                    <>
                      {msg} <span className="text-yellow-400">(Try using an Image URL instead.)</span>
                    </>
                  ) : (
                    `${field}: ${msg}`
                  )}
                </li>
              ));
            })}
          </ul>
        )}
      </div>
    );
  };

  // Safe form validation - FIXED
  const isFormValid = () => {
    const titleValid = form.title?.trim?.() || '';
    const imageValid = form.image || (form.image_url?.trim?.() || '');
    return titleValid && imageValid;
  };

  return (
    <div className="p-8 bg-[#111] min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🎵 Songs Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors"
          >
            <Filter className="w-4 h-4" /> 
            Filter
            {hasActiveFilters && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Search Spotify
              </>
            )}
          </button>
          <button
            onClick={() => handleOpen()}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Song
              </>
            )}
          </button>
        </div>
      </header>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-[#1b1b1b] rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Active filters:</span>
              {filters.title && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  Title: {filters.title}
                </span>
              )}
              {filters.artist && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                  Artist: {filters.artist}
                </span>
              )}
              {filters.album && (
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                  Album: {filters.album}
                </span>
              )}
              {filters.hasSpotifyId && (
                <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                  Has Spotify ID
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <X className="w-4 h-4" /> Clear all
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {renderError()}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading songs...</p>
        </div>
      )}

      {/* Songs List */}
      <div className="space-y-6">
        {filteredSongs.length === 0 && !loading ? (
          <div className="text-gray-400 italic text-center py-20">
            {hasActiveFilters ? "No songs match your filters." : "No songs yet. Add one to get started."}
          </div>
        ) : (
          filteredSongs.map((song) => (
            <div
              key={song.id}
              className="bg-[#1b1b1b] rounded-xl shadow border border-gray-800 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {song.image_url ? (
                    <img
                      src={song.image_url.startsWith('http') ? song.image_url : `/storage/${song.image_url}`}
                      alt={song.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                      <Music2 className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{song.title}</h2>
                    <p className="text-gray-400 text-sm">
                      {song.artist && `Artist: ${song.artist}`}
                      {song.album && ` • Album: ${song.album}`}
                      {song.duration_ms && ` • Duration: ${formatDuration(song.duration_ms)}`}
                    </p>
                    {song.spotify_id && (
                      <p className="text-gray-500 text-xs">Spotify ID: {song.spotify_id}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(song)}
                    disabled={loading || editLoading === song.id}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center w-10 h-10"
                  >
                    {editLoading === song.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Pencil className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(song)}
                    disabled={loading || deleteButtonLoading === song.id}
                    className="p-2 bg-red-700 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center w-10 h-10"
                  >
                    {deleteButtonLoading === song.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filter Modal */}
      <Dialog open={filterOpen} onClose={setFilterOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-md">
            <DialogTitle className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span>Filter Songs</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </DialogTitle>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title contains:</label>
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Artist contains:</label>
                <input
                  type="text"
                  placeholder="Filter by artist..."
                  value={filters.artist}
                  onChange={(e) => setFilters({ ...filters, artist: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Album contains:</label>
                <input
                  type="text"
                  placeholder="Filter by album..."
                  value={filters.album}
                  onChange={(e) => setFilters({ ...filters, album: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasSpotifyId"
                  checked={filters.hasSpotifyId}
                  onChange={(e) => setFilters({ ...filters, hasSpotifyId: e.target.checked })}
                  className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="hasSpotifyId" className="text-sm font-medium">
                  Only show songs with Spotify ID
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Add/Edit Song Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-lg">
            <DialogTitle className="text-lg font-semibold mb-4">
              {selectedSong ? "Edit Song" : "Add Song"}
            </DialogTitle>
            
            {saveLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-20">
                <div className="flex items-center gap-3 bg-[#2a2a2a] px-4 py-3 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white text-sm">
                    {selectedSong ? "Updating song..." : "Creating song..."}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Song Title *"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                required
                maxLength={255}
                disabled={saveLoading}
              />
              <input
                type="text"
                placeholder="Artist"
                value={form.artist || ''}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                maxLength={255}
                disabled={saveLoading}
              />
              <input
                type="text"
                placeholder="Album"
                value={form.album || ''}
                onChange={(e) => setForm({ ...form, album: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                maxLength={255}
                disabled={saveLoading}
              />
              <input
                type="number"
                placeholder="Duration (milliseconds)"
                value={form.duration_ms || ''}
                onChange={(e) => setForm({ ...form, duration_ms: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                min="0"
                disabled={saveLoading}
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={form.image_url || ''}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                maxLength={65535}
                disabled={saveLoading}
              />
              <div className="border-t border-gray-700 pt-4">
                <label className="block text-sm font-medium mb-2">Or upload image (optional):</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                  disabled={saveLoading}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={saveLoading}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid() || saveLoading}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {selectedSong ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Spotify Search Modal */}
      <Dialog open={searchOpen} onClose={setSearchOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-2xl">
            <DialogTitle className="text-lg font-semibold mb-4">
              Search Spotify
            </DialogTitle>

            {searchLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-20">
                <div className="flex items-center gap-3 bg-[#2a2a2a] px-4 py-3 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white text-sm">Searching Spotify...</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search for songs on Spotify..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                disabled={searchLoading}
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searchLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed rounded flex items-center gap-2 transition-colors"
              >
                {searchLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Search
                  </>
                )}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((track) => (
                  <div
                    key={track.spotify_id}
                    className="flex items-center justify-between bg-[#222] rounded p-3 relative"
                  >
                    {importLoading === track.spotify_id && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-2 rounded">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="text-white text-sm">Importing...</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {track.image_url && (
                        <img
                          src={track.image_url}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-gray-400 text-sm">
                          {track.artist} • {track.album}
                          {track.duration_ms && ` • ${formatDuration(track.duration_ms)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImport(track)}
                      disabled={importLoading !== null}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded text-sm transition-colors"
                    >
                      {importLoading === track.spotify_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Importing
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" /> Import
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  dispatch(clearSearchResults());
                }}
                disabled={searchLoading || importLoading !== null}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onClose={setDeleteOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-md">
            <DialogTitle className="text-lg font-semibold mb-4">
              Delete Song
            </DialogTitle>

            {deleteLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-20">
                <div className="flex items-center gap-3 bg-[#2a2a2a] px-4 py-3 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white text-sm">Deleting song...</span>
                </div>
              </div>
            )}

            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedSong?.title}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}