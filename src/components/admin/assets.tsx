"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Trash2, Pencil, X, Plus, Search, Download } from "lucide-react";
import { 
  fetchAssets, 
  createAsset, 
  updateAsset, 
  deleteAsset,
  clearError 
} from "../../slices/assetSlice";
import { fetchSongs, searchSpotify, importSpotify, clearSearchResults } from "../../slices/songSlice";
import { fetchBaskets } from "../../slices/basketSlice";
import { RootState, AppDispatch } from "../../store";
import { Asset, CreateAssetData, UpdateAssetData } from "../../types/asset";
import { SpotifyTrack } from "../../types/song";

export default function AssetsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { assets, loading, error } = useSelector((state: RootState) => state.assets);
  const { songs, searchResults } = useSelector((state: RootState) => state.songs);
  const { baskets } = useSelector((state: RootState) => state.baskets);
  
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    type: "single" as "single" | "basket",
    artist: "",
    genre: "",
    price: "",
    expected_roi_percent: "",
    current_roi_percent: "",
    total_shares: "",
    available_shares: "",
    status: "active" as "active" | "inactive",
    song_id: "",
    basket_id: "",
  });

  useEffect(() => {
    dispatch(fetchAssets({ per_page: 100 }));
    dispatch(fetchSongs());
    dispatch(fetchBaskets());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Convert image to base64 with MIME type
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Open add/edit modal
  const openModal = (asset: Asset | null = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setFormData({
        title: asset.title || "",
        slug: asset.slug || "",
        type: asset.type || "single",
        artist: asset.artist || "",
        genre: asset.genre || "",
        price: asset.price?.toString() || "",
        expected_roi_percent: asset.expected_roi_percent?.toString() || "",
        current_roi_percent: asset.current_roi_percent?.toString() || "",
        total_shares: asset.total_shares?.toString() || "",
        available_shares: asset.available_shares?.toString() || "",
        status: asset.status || "active",
        song_id: asset.song_id?.toString() || "",
        basket_id: asset.basket_id?.toString() || "",
      });
    } else {
      setSelectedAsset(null);
      setFormData({
        title: "",
        slug: "",
        type: "single",
        artist: "",
        genre: "",
        price: "",
        expected_roi_percent: "",
        current_roi_percent: "",
        total_shares: "",
        available_shares: "",
        status: "active",
        song_id: "",
        basket_id: "",
      });
    }
    setImageFile(null);
    setModalOpen(true);
  };

  // Save asset (add or edit)
  const handleSave = async () => {
    try {
      let payload: CreateAssetData | UpdateAssetData = {
        title: formData.title,
        type: formData.type,
        price: parseFloat(formData.price),
        total_shares: parseInt(formData.total_shares),
        status: formData.status,
      };

      // Add optional fields if they have values
      if (formData.slug) (payload as any).slug = formData.slug;
      if (formData.artist) (payload as any).artist = formData.artist;
      if (formData.genre) (payload as any).genre = formData.genre;
      if (formData.expected_roi_percent) (payload as any).expected_roi_percent = parseFloat(formData.expected_roi_percent);
      if (formData.current_roi_percent) (payload as any).current_roi_percent = parseFloat(formData.current_roi_percent);
      if (formData.available_shares) (payload as any).available_shares = parseInt(formData.available_shares);

      // Handle song_id and basket_id based on type
      if (formData.type === 'single' && formData.song_id) {
        (payload as any).song_id = parseInt(formData.song_id);
        (payload as any).basket_id = null;
      } else if (formData.type === 'basket' && formData.basket_id) {
        (payload as any).basket_id = parseInt(formData.basket_id);
        (payload as any).song_id = null;
      }

      // Handle image upload
      if (imageFile) {
        const base64 = await convertImageToBase64(imageFile);
        (payload as any).image_base64 = base64.split(',')[1];
      }

      if (selectedAsset) {
        // Update existing asset
        await dispatch(updateAsset({ id: selectedAsset.id, assetData: payload })).unwrap();
      } else {
        // Create new asset
        await dispatch(createAsset(payload as CreateAssetData)).unwrap();
      }

      setModalOpen(false);
      dispatch(fetchAssets({ per_page: 100 }));
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  // Import song as asset
  // Import song as asset
const importSongAsAsset = async (song: any) => {
  try {
    const payload: CreateAssetData = {
      title: song.title,
      type: "single",
      artist: song.artist,
      price: 10.00, // Default price, can be adjusted
      total_shares: 1000, // Default shares
      status: "active",
      song_id: song.id, // Make sure this is included
      genre: "Music", // Default genre
      expected_roi_percent: 15.0, // Default ROI
      current_roi_percent: 0.0,
      available_shares: 1000,
    };

    await dispatch(createAsset(payload)).unwrap();
    setSearchModalOpen(false);
    setSearchQuery("");
    dispatch(clearSearchResults());
    dispatch(fetchAssets({ per_page: 100 }));
    
    console.log('✅ Song imported as asset successfully');
  } catch (error) {
    console.error('❌ Error importing song as asset:', error);
  }
};

// Import from Spotify as asset
const importSpotifyAsAsset = async (track: SpotifyTrack) => {
  try {
    // First import the song to get a song_id
    const result = await dispatch(importSpotify(track.spotify_id)).unwrap();
    const importedSong = result.song;
    
    // Then create asset from the imported song with the song_id
    const payload: CreateAssetData = {
      title: track.title,
      type: "single",
      artist: track.artist,
      price: 10.00,
      total_shares: 1000,
      status: "active",
      song_id: importedSong.id, // Use the imported song's ID
      genre: "Music",
      expected_roi_percent: 15.0,
      current_roi_percent: 0.0,
      available_shares: 1000,
    };

    await dispatch(createAsset(payload)).unwrap();
    setSearchModalOpen(false);
    setSearchQuery("");
    dispatch(clearSearchResults());
    dispatch(fetchAssets({ per_page: 100 }));
    
    console.log('✅ Spotify track imported as asset successfully');
  } catch (error) {
    console.error('❌ Error importing Spotify track as asset:', error);
  }
};

  // Search Spotify
  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchSpotify(searchQuery));
    }
  };

  // Handle delete
  const handleDelete = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAsset) {
      try {
        await dispatch(deleteAsset(selectedAsset.id)).unwrap();
        setDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle type change - reset related IDs
  const handleTypeChange = (type: "single" | "basket") => {
    setFormData(prev => ({
      ...prev,
      type,
      song_id: type === 'basket' ? '' : prev.song_id,
      basket_id: type === 'single' ? '' : prev.basket_id
    }));
  };

  // Format duration from milliseconds to minutes:seconds
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <div className="p-8 bg-[#111] min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📊 Assets Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow text-sm font-medium"
          >
            <Search className="w-4 h-4" /> Import Song
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-600 rounded-lg text-white">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      )}

      {/* Assets Table */}
      <div className="bg-[#1b1b1b] rounded-xl shadow border border-gray-800 p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Genre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expected ROI %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Current ROI %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Shares</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Available Shares</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#1b1b1b] divide-y divide-gray-700">
            {assets.map(asset => (
              <tr key={asset.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  {asset.image_base64 ? (
                    <img 
                      src={`data:image/jpeg;base64,${asset.image_base64}`} 
                      alt={asset.title} 
                      className="w-12 h-12 rounded object-cover" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-medium">{asset.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    asset.type === 'single' ? 'bg-blue-600 text-blue-100' : 'bg-purple-600 text-purple-100'
                  }`}>
                    {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.artist || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.genre || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">${asset.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {asset.expected_roi_percent ? `${asset.expected_roi_percent}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {asset.current_roi_percent ? `${asset.current_roi_percent}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.total_shares}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.available_shares}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    asset.status === 'active' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                  }`}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button 
                    onClick={() => openModal(asset)} 
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(asset)} 
                    className="p-2 bg-red-700 hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {assets.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 italic">
              No assets found. Add one to get started.
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-xl font-bold text-white">
                {selectedAsset ? "Edit Asset" : "Add Asset"}
              </DialogTitle>
              <button 
                className="text-gray-400 hover:text-white" 
                onClick={() => setModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="Asset title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="auto-generated-if-empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as "single" | "basket")}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  >
                    <option value="single">Single</option>
                    <option value="basket">Basket</option>
                  </select>
                </div>

                {formData.type === 'single' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Song</label>
                    <select
                      value={formData.song_id}
                      onChange={(e) => handleInputChange('song_id', e.target.value)}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    >
                      <option value="">Select Song</option>
                      {songs.map(song => (
                        <option key={song.id} value={song.id}>
                          {song.title} {song.artist && `- ${song.artist}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === 'basket' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Basket</label>
                    <select
                      value={formData.basket_id}
                      onChange={(e) => handleInputChange('basket_id', e.target.value)}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    >
                      <option value="">Select Basket</option>
                      {baskets.map(basket => (
                        <option key={basket.id} value={basket.id}>
                          {basket.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Artist</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="Artist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="Genre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Total Shares *</label>
                  <input
                    type="number"
                    value={formData.total_shares}
                    onChange={(e) => handleInputChange('total_shares', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* ROI and Status */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Expected ROI %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.expected_roi_percent}
                    onChange={(e) => handleInputChange('expected_roi_percent', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="10.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current ROI %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_roi_percent}
                    onChange={(e) => handleInputChange('current_roi_percent', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="8.2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Available Shares</label>
                  <input
                    type="number"
                    value={formData.available_shares}
                    onChange={(e) => handleInputChange('available_shares', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="Auto-sets to total shares if empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as "active" | "inactive")}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  />
                </div>

                {selectedAsset?.image_base64 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Current Image</label>
                    <img
                      src={`data:image/jpeg;base64,${selectedAsset.image_base64}`}
                      alt="Current"
                      className="w-32 h-32 rounded object-cover"
                      onError={(e) => console.log('Image load error:', e)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title || !formData.price || !formData.total_shares}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedAsset ? "Update" : "Add"} Asset
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Import Song Modal */}
      <Dialog open={searchModalOpen} onClose={() => setSearchModalOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-xl font-bold text-white">
                Import Song as Asset
              </DialogTitle>
              <button 
                className="text-gray-400 hover:text-white" 
                onClick={() => {
                  setSearchModalOpen(false);
                  setSearchQuery("");
                  dispatch(clearSearchResults());
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Section */}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search for songs on Spotify..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </button>
              </div>

              {/* Spotify Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-white">Spotify Results</h3>
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
                          <p className="font-medium text-white">{track.title}</p>
                          <p className="text-gray-400 text-sm">
                            {track.artist} • {track.album}
                            {track.duration_ms && ` • ${formatDuration(track.duration_ms)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => importSpotifyAsAsset(track)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
                      >
                        <Download className="w-4 h-4" /> Import as Asset
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Songs Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Existing Songs</h3>
              {songs.length === 0 ? (
                <div className="text-gray-400 italic text-center py-4">
                  No songs available. Search Spotify to import songs first.
                </div>
              ) : (
                songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between bg-[#222] rounded p-3"
                  >
                    <div className="flex items-center gap-3">
                      {song.image_url ? (
                        <img
                          src={song.image_url.startsWith('http') ? song.image_url : `/storage/${song.image_url}`}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{song.title}</p>
                        <p className="text-gray-400 text-sm">
                          {song.artist && `Artist: ${song.artist}`}
                          {song.album && ` • Album: ${song.album}`}
                          {song.duration_ms && ` • Duration: ${formatDuration(song.duration_ms)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => importSongAsAsset(song)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-sm text-white"
                    >
                      <Download className="w-4 h-4" /> Create Asset
                    </button>
                  </div>
                ))
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-white">
                Delete Asset
              </DialogTitle>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-bold">{selectedAsset?.title}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white"
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