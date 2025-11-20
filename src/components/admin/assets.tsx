"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Trash2, Pencil, X, Plus, Search, Download, Filter } from "lucide-react";
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [songSearchQuery, setSongSearchQuery] = useState("");
  
  // Loading states
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [importLoading, setImportLoading] = useState<string | null>(null);
  const [songImportLoading, setSongImportLoading] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState<number | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    title: "",
    artist: "",
    genre: "",
    type: "",
    status: "",
    risk_rating: "",
    minPrice: "",
    maxPrice: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    type: "single" as "single" | "basket",
    artist: "",
    genre: "",
    price: "",
    expected_roi_percent: "",
    expected_roi_min: "",
    expected_roi_max: "",
    current_roi_percent: "",
    total_shares: "",
    available_shares: "",
    status: "active" as "active" | "inactive",
    song_id: "",
    basket_id: "",
    risk_rating: "medium" as "low" | "medium" | "high",
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

  // Filter assets based on filter criteria
  const filteredAssets = assets.filter(asset => {
    if (filters.title && !asset.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    if (filters.artist && !asset.artist?.toLowerCase().includes(filters.artist.toLowerCase())) {
      return false;
    }
    if (filters.genre && !asset.genre?.toLowerCase().includes(filters.genre.toLowerCase())) {
      return false;
    }
    if (filters.type && asset.type !== filters.type) {
      return false;
    }
    if (filters.status && asset.status !== filters.status) {
      return false;
    }
    if (filters.risk_rating && asset.risk_rating !== filters.risk_rating) {
      return false;
    }
    if (filters.minPrice && asset.price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && asset.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    return true;
  });

  // Filter songs based on search query
  const filteredSongs = songs.filter(song => {
    if (!songSearchQuery.trim()) return true;
    
    const query = songSearchQuery.toLowerCase();
    return (
      song.title?.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query) ||
      song.album?.toLowerCase().includes(query) ||
      song.genre?.toLowerCase().includes(query)
    );
  });

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      title: "",
      artist: "",
      genre: "",
      type: "",
      status: "",
      risk_rating: "",
      minPrice: "",
      maxPrice: "",
    });
  };

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

  // Helper function to display ROI in table
  const getExpectedROIDisplay = (asset: Asset) => {
    if (asset.expected_roi_min !== null && asset.expected_roi_max !== null && 
        asset.expected_roi_min !== undefined && asset.expected_roi_max !== undefined) {
      return `${asset.expected_roi_min}% - ${asset.expected_roi_max}%`;
    }
    return asset.expected_roi_percent ? `${asset.expected_roi_percent}%` : '-';
  };

  // Clear ROI fields when switching input methods
  const clearROIFields = (useRange: boolean) => {
    if (useRange) {
      setFormData(prev => ({
        ...prev,
        expected_roi_percent: "",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        expected_roi_min: "",
        expected_roi_max: "",
      }));
    }
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
        expected_roi_min: asset.expected_roi_min?.toString() || "",
        expected_roi_max: asset.expected_roi_max?.toString() || "",
        current_roi_percent: asset.current_roi_percent?.toString() || "",
        total_shares: asset.total_shares?.toString() || "",
        available_shares: asset.available_shares?.toString() || "",
        status: asset.status || "active",
        song_id: asset.song_id?.toString() || "",
        basket_id: asset.basket_id?.toString() || "",
        risk_rating: asset.risk_rating || "medium",
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
        expected_roi_min: "",
        expected_roi_max: "",
        current_roi_percent: "",
        total_shares: "",
        available_shares: "",
        status: "active",
        song_id: "",
        basket_id: "",
        risk_rating: "medium",
      });
    }
    setImageFile(null);
    setModalOpen(true);
  };

  // Save asset (add or edit)
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      let payload: CreateAssetData | UpdateAssetData = {
        title: formData.title,
        type: formData.type,
        price: parseFloat(formData.price),
        total_shares: parseInt(formData.total_shares),
        status: formData.status,
        risk_rating: formData.risk_rating,
      };

      // Add optional fields if they have values
      if (formData.slug) (payload as any).slug = formData.slug;
      if (formData.artist) (payload as any).artist = formData.artist;
      if (formData.genre) (payload as any).genre = formData.genre;
      
      // Handle ROI fields - either single percent or range
      if (formData.expected_roi_percent) {
        (payload as any).expected_roi_percent = parseFloat(formData.expected_roi_percent);
        // Clear range if using single percent
        (payload as any).expected_roi_min = null;
        (payload as any).expected_roi_max = null;
      } else if (formData.expected_roi_min && formData.expected_roi_max) {
        (payload as any).expected_roi_min = parseFloat(formData.expected_roi_min);
        (payload as any).expected_roi_max = parseFloat(formData.expected_roi_max);
        // Clear single percent if using range
        (payload as any).expected_roi_percent = null;
      } else {
        // If neither single ROI nor range is provided, clear all ROI fields
        (payload as any).expected_roi_percent = null;
        (payload as any).expected_roi_min = null;
        (payload as any).expected_roi_max = null;
      }
      
      if (formData.current_roi_percent) (payload as any).current_roi_percent = parseFloat(formData.current_roi_percent);
      if (formData.available_shares) (payload as any).available_shares = parseInt(formData.available_shares);

      // Handle song_id and basket_id based on type
      if (formData.type === 'single' && formData.song_id) {
        (payload as any).song_id = parseInt(formData.song_id);
        (payload as any).basket_id = null;
      } else if (formData.type === 'basket' && formData.basket_id) {
        (payload as any).basket_id = parseInt(formData.basket_id);
        (payload as any).song_id = null;
      } else {
        // Clear both if type doesn't match
        (payload as any).song_id = null;
        (payload as any).basket_id = null;
      }

      // Handle image upload
      if (imageFile) {
        const base64 = await convertImageToBase64(imageFile);
        (payload as any).image_base64 = base64.split(',')[1];
      }

      console.log('Saving asset with payload:', payload); // Debug log

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
    } finally {
      setSaveLoading(false);
    }
  };

  // Import song as asset
  const importSongAsAsset = async (song: any) => {
    try {
      setSongImportLoading(song.id);
      const payload: CreateAssetData = {
        title: song.title,
        type: "single",
        artist: song.artist,
        price: 10.00, // Default price, can be adjusted
        total_shares: 1000, // Default shares
        status: "active",
        song_id: song.id, // Make sure this is included
        genre: "Music", // Default genre
        expected_roi_min: 10.0, // Default ROI range
        expected_roi_max: 20.0,
        current_roi_percent: 0.0,
        available_shares: 1000,
        risk_rating: "medium", // Default risk rating
      };

      await dispatch(createAsset(payload)).unwrap();
      setSearchModalOpen(false);
      setSearchQuery("");
      dispatch(clearSearchResults());
      dispatch(fetchAssets({ per_page: 100 }));
      
      console.log('✅ Song imported as asset successfully');
    } catch (error) {
      console.error('❌ Error importing song as asset:', error);
    } finally {
      setSongImportLoading(null);
    }
  };

  // Import from Spotify as asset
  const importSpotifyAsAsset = async (track: SpotifyTrack) => {
    try {
      setImportLoading(track.spotify_id);
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
        expected_roi_min: 10.0,
        expected_roi_max: 20.0,
        current_roi_percent: 0.0,
        available_shares: 1000,
        risk_rating: "medium", // Default risk rating
      };

      await dispatch(createAsset(payload)).unwrap();
      setSearchModalOpen(false);
      setSearchQuery("");
      dispatch(clearSearchResults());
      dispatch(fetchAssets({ per_page: 100 }));
      
      console.log('✅ Spotify track imported as asset successfully');
    } catch (error) {
      console.error('❌ Error importing Spotify track as asset:', error);
    } finally {
      setImportLoading(null);
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

  // Handle delete
  const handleDelete = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteModalOpen(true);
  };

  // Handle individual edit button click
  const handleEditClick = async (asset: Asset) => {
    setEditLoading(asset.id);
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      openModal(asset);
    } finally {
      setEditLoading(null);
    }
  };

  // Handle individual delete button click
  const handleDeleteClick = async (asset: Asset) => {
    setDeleteButtonLoading(asset.id);
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      setSelectedAsset(asset);
      setDeleteModalOpen(true);
    } finally {
      setDeleteButtonLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedAsset) {
      try {
        setDeleteLoading(true);
        await dispatch(deleteAsset(selectedAsset.id)).unwrap();
        setDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting asset:', error);
      } finally {
        setDeleteLoading(false);
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
        <h1 className="text-2xl font-bold">Assets Manager</h1>
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
            onClick={() => setSearchModalOpen(true)}
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
                <Search className="w-4 h-4" /> Import Song
              </>
            )}
          </button>
          <button
            onClick={() => openModal()}
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
                <Plus className="w-4 h-4" /> Add Asset
              </>
            )}
          </button>
        </div>
      </header>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-[#1b1b1b] rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
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
              {filters.genre && (
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                  Genre: {filters.genre}
                </span>
              )}
              {filters.type && (
                <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                  Type: {filters.type}
                </span>
              )}
              {filters.status && (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                  Status: {filters.status}
                </span>
              )}
              {filters.risk_rating && (
                <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs">
                  Risk: {filters.risk_rating}
                </span>
              )}
              {filters.minPrice && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                  Min Price: ${filters.minPrice}
                </span>
              )}
              {filters.maxPrice && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                  Max Price: ${filters.maxPrice}
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
      {error && (
        <div className="mb-4 p-4 bg-red-600 rounded-lg text-white">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading assets...</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#1b1b1b] divide-y divide-gray-700">
            {filteredAssets.map(asset => (
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
                  {getExpectedROIDisplay(asset)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {asset.current_roi_percent ? `${asset.current_roi_percent}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.total_shares}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.available_shares}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    asset.risk_rating === 'low' ? 'bg-green-600 text-green-100' : 
                    asset.risk_rating === 'medium' ? 'bg-yellow-600 text-yellow-100' : 
                    asset.risk_rating === 'high' ? 'bg-red-600 text-red-100' :
                    'bg-gray-600 text-gray-100'
                  }`}>
                    {asset.risk_rating ? asset.risk_rating.charAt(0).toUpperCase() + asset.risk_rating.slice(1) : 'Not Set'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    asset.status === 'active' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                  }`}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button 
                    onClick={() => handleEditClick(asset)} 
                    disabled={editLoading === asset.id}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center w-10 h-10"
                  >
                    {editLoading === asset.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Pencil className="w-4 h-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(asset)} 
                    disabled={deleteButtonLoading === asset.id}
                    className="p-2 bg-red-700 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center w-10 h-10"
                  >
                    {deleteButtonLoading === asset.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssets.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 italic">
              {hasActiveFilters ? "No assets match your filters." : "No assets found. Add one to get started."}
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-xl font-bold text-white">
                Filter Assets
              </DialogTitle>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title contains:</label>
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Artist contains:</label>
                <input
                  type="text"
                  placeholder="Filter by artist..."
                  value={filters.artist}
                  onChange={(e) => setFilters({ ...filters, artist: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Genre contains:</label>
                <input
                  type="text"
                  placeholder="Filter by genre..."
                  value={filters.genre}
                  onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  >
                    <option value="">All Types</option>
                    <option value="single">Single</option>
                    <option value="basket">Basket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Risk Rating</label>
                <select
                  value={filters.risk_rating}
                  onChange={(e) => setFilters({ ...filters, risk_rating: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                >
                  <option value="">All Ratings</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
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

            {saveLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-20">
                <div className="flex items-center gap-3 bg-[#2a2a2a] px-4 py-3 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white text-sm">
                    {selectedAsset ? "Updating asset..." : "Creating asset..."}
                  </span>
                </div>
              </div>
            )}

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
                    disabled={saveLoading}
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
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as "single" | "basket")}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    disabled={saveLoading}
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
                      disabled={saveLoading}
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
                      disabled={saveLoading}
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
                    disabled={saveLoading}
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
                    disabled={saveLoading}
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
                    disabled={saveLoading}
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
                    disabled={saveLoading}
                  />
                </div>
              </div>

              {/* ROI and Status */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Expected ROI % (Single)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.expected_roi_percent}
                    onChange={(e) => {
                      handleInputChange('expected_roi_percent', e.target.value);
                      if (e.target.value) clearROIFields(false);
                    }}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    placeholder="10.5"
                    disabled={saveLoading}
                  />
                  <p className="text-xs text-gray-400 mt-1">Or use range below</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Expected ROI Min %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.expected_roi_min}
                      onChange={(e) => {
                        handleInputChange('expected_roi_min', e.target.value);
                        if (e.target.value) clearROIFields(true);
                      }}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                      placeholder="8.0"
                      disabled={saveLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Expected ROI Max %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.expected_roi_max}
                      onChange={(e) => {
                        handleInputChange('expected_roi_max', e.target.value);
                        if (e.target.value) clearROIFields(true);
                      }}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                      placeholder="15.0"
                      disabled={saveLoading}
                    />
                  </div>
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
                    disabled={saveLoading}
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
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Risk Rating</label>
                  <select
                    value={formData.risk_rating}
                    onChange={(e) => handleInputChange('risk_rating', e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    disabled={saveLoading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as "active" | "inactive")}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    disabled={saveLoading}
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
                    disabled={saveLoading}
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
                disabled={saveLoading}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title || !formData.price || !formData.total_shares || saveLoading}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {selectedAsset ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  selectedAsset ? "Update Asset" : "Add Asset"
                )}
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
                  disabled={searchLoading}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed rounded text-white transition-colors flex items-center gap-2"
                  disabled={!searchQuery.trim() || searchLoading}
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

              {/* Spotify Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-white">Spotify Results</h3>
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
                          <p className="font-medium text-white">{track.title}</p>
                          <p className="text-gray-400 text-sm">
                            {track.artist} • {track.album}
                            {track.duration_ms && ` • ${formatDuration(track.duration_ms)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => importSpotifyAsAsset(track)}
                        disabled={importLoading !== null}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
                      >
                        {importLoading === track.spotify_id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Importing
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Import as Asset
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Songs Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Existing Songs</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Filter existing songs..."
                    value={songSearchQuery}
                    onChange={(e) => setSongSearchQuery(e.target.value)}
                    className="w-48 p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 text-sm"
                  />
                  {songSearchQuery && (
                    <button
                      onClick={() => setSongSearchQuery("")}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {filteredSongs.length === 0 ? (
                <div className="text-gray-400 italic text-center py-4">
                  {songSearchQuery ? "No songs match your search." : "No songs available. Search Spotify to import songs first."}
                </div>
              ) : (
                filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between bg-[#222] rounded p-3 relative"
                  >
                    {songImportLoading === song.id && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-2 rounded">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="text-white text-sm">Creating Asset...</span>
                        </div>
                      </div>
                    )}
                    
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
                      disabled={songImportLoading !== null}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
                    >
                      {songImportLoading === song.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" /> Create Asset
                        </>
                      )}
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

            {deleteLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-20">
                <div className="flex items-center gap-3 bg-[#2a2a2a] px-4 py-3 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white text-sm">Deleting asset...</span>
                </div>
              </div>
            )}

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-bold">{selectedAsset?.title}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
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