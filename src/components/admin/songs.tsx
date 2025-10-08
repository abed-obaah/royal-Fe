"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Plus, Pencil, Trash2, Music2, Search, Download } from "lucide-react";
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
    dispatch(clearError()); // Clear error when opening the modal
  };

  // Save Song
  const handleSave = () => {
    if (!form.title.trim()) {
      dispatch({ type: 'songs/createSong/rejected', payload: { message: 'Validation failed', errors: { title: ['The title field is required.'] } } });
      return;
    }

    if (!form.image && !form.image_url.trim()) {
      dispatch({ type: 'songs/createSong/rejected', payload: { message: 'Validation failed', errors: { image: ['Either an image file or image URL must be provided.'] } } });
      return;
    }

    if (selectedSong) {
      // Update existing song
      dispatch(updateSong({ 
        id: selectedSong.id, 
        songData: {
          title: form.title,
          artist: form.artist,
          album: form.album,
          duration_ms: form.duration_ms ? parseInt(form.duration_ms) : undefined,
          image_url: form.image_url || undefined,
        }
      }));
    } else {
      // Create new song
      if (form.image) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('artist', form.artist);
        formData.append('album', form.album);
        formData.append('duration_ms', form.duration_ms);
        formData.append('image', form.image);
        if (form.image_url) formData.append('image_url', form.image_url); // Optional
        dispatch(createSong(formData));
      } else {
        dispatch(createSong({
          title: form.title,
          artist: form.artist,
          album: form.album,
          duration_ms: form.duration_ms ? parseInt(form.duration_ms) : undefined,
          image_url: form.image_url,
        }));
      }
    }
    setOpen(false);
  };

  // Delete Song
  const handleDelete = () => {
    if (selectedSong) {
      dispatch(deleteSong(selectedSong.id));
    }
    setDeleteOpen(false);
  };

  // Search Spotify
  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchSpotify(searchQuery));
    }
  };

  // Import from Spotify
  const handleImport = (track: SpotifyTrack) => {
    dispatch(importSpotify(track.spotify_id));
    setSearchOpen(false);
    setSearchQuery("");
    dispatch(clearSearchResults());
  };

  // Format duration from milliseconds to minutes:seconds
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  // Render error details
  const renderError = () => {
    if (!error) return null;
    if (typeof error === 'string') {
      return <div className="mb-4 p-4 bg-red-600 rounded-lg text-white">{error}</div>;
    }
    return (
      <div className="mb-4 p-4 bg-red-600 rounded-lg text-white">
        <p>{error.message}</p>
        {Object.keys(error.errors).length > 0 && (
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(error.errors).map(([field, messages]) =>
              messages.map((msg: string, index: number) => (
                <li key={`${field}-${index}`}>
                  {field === 'image' && msg.includes('server error') ? (
                    <>
                      {msg} <span className="text-yellow-400">(Try using an Image URL instead.)</span>
                    </>
                  ) : (
                    `${field}: ${msg}`
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#111] min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🎵 Songs Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow text-sm font-medium"
          >
            <Search className="w-4 h-4" /> Search Spotify
          </button>
          <button
            onClick={() => handleOpen()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Song
          </button>
        </div>
      </header>

      {/* Error Display */}
      {renderError()}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      )}

      {/* Songs List */}
      <div className="space-y-6">
        {songs.length === 0 && !loading ? (
          <div className="text-gray-400 italic text-center py-20">
            No songs yet. Add one to get started.
          </div>
        ) : (
          songs.map((song) => (
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
                    onClick={() => handleOpen(song)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSong(song);
                      setDeleteOpen(true);
                    }}
                    className="p-2 bg-red-700 hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Song Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-lg">
            <DialogTitle className="text-lg font-semibold mb-4">
              {selectedSong ? "Edit Song" : "Add Song"}
            </DialogTitle>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Song Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                required
                maxLength={255}
              />
              <input
                type="text"
                placeholder="Artist"
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                maxLength={255}
              />
              <input
                type="text"
                placeholder="Album"
                value={form.album}
                onChange={(e) => setForm({ ...form, album: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                maxLength={255}
              />
              <input
                type="number"
                placeholder="Duration (milliseconds)"
                value={form.duration_ms}
                onChange={(e) => setForm({ ...form, duration_ms: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                min="0"
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                maxLength={65535}
              />
              <div className="border-t border-gray-700 pt-4">
                <label className="block text-sm font-medium mb-2">Or upload image (optional):</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
                disabled={!form.title.trim() || (!form.image && !form.image_url.trim())}
              >
                Save
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
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search for songs on Spotify..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
                disabled={!searchQuery.trim()}
              >
                Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((track) => (
                  <div
                    key={track.spotify_id}
                    className="flex items-center justify-between bg-[#222] rounded p-3"
                  >
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
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                    >
                      <Download className="w-4 h-4" /> Import
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
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
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
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedSong?.title}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}