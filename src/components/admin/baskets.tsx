"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Plus, Pencil, Trash2, Music2, Layers, Filter, X } from "lucide-react";
import { 
  fetchBaskets, 
  createBasket, 
  updateBasket, 
  deleteBasket, 
  addSongsToBasket 
} from "../../slices/basketSlice";
import { fetchSongs } from "../../slices/songSlice";
import { RootState, AppDispatch } from "../../store";
import { Basket } from "../../types/basket";
import { Song } from "../../types/song";

export default function BasketsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { baskets, loading, error } = useSelector((state: RootState) => state.baskets);
  const { songs } = useSelector((state: RootState) => state.songs);
  
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [songsModalOpen, setSongsModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<Basket | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    risk_rating: "",
    minPrice: "",
    maxPrice: "",
    minSongs: "",
    maxSongs: "",
  });

  const [form, setForm] = useState({
    name: "",
    risk_rating: "",
    expected_roi_range: "",
    price: "",
    roi_to_date: "",
    image_base64: "",
  });

  useEffect(() => {
    dispatch(fetchBaskets());
    dispatch(fetchSongs());
  }, [dispatch]);

  // Filter baskets based on criteria
  const filteredBaskets = baskets.filter(basket => {
    if (filters.name && !basket.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    if (filters.risk_rating && basket.risk_rating !== filters.risk_rating) {
      return false;
    }
    if (filters.minPrice && basket.price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && basket.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    if (filters.minSongs && (basket.songs?.length || 0) < parseInt(filters.minSongs)) {
      return false;
    }
    if (filters.maxSongs && (basket.songs?.length || 0) > parseInt(filters.maxSongs)) {
      return false;
    }
    return true;
  });

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      name: "",
      risk_rating: "",
      minPrice: "",
      maxPrice: "",
      minSongs: "",
      maxSongs: "",
    });
  };

  // Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Open Add/Edit Basket
  const handleOpen = (basket: Basket | null = null) => {
    if (basket) {
      setForm({
        name: basket.name,
        risk_rating: basket.risk_rating || "",
        expected_roi_range: basket.expected_roi_range || "",
        price: basket.price.toString(),
        roi_to_date: basket.roi_to_date?.toString() || "",
        image_base64: basket.image || "",
      });
      setSelectedBasket(basket);
    } else {
      setForm({
        name: "",
        risk_rating: "",
        expected_roi_range: "",
        price: "",
        roi_to_date: "",
        image_base64: "",
      });
      setSelectedBasket(null);
      setImageFile(null);
    }
    setOpen(true);
  };

  // Save Basket
  const handleSave = async () => {
    try {
      let imageBase64 = form.image_base64;

      // Convert image file to base64 if provided
      if (imageFile) {
        imageBase64 = await convertImageToBase64(imageFile);
      }

      if (selectedBasket) {
        // Update existing basket
        dispatch(updateBasket({ 
          id: selectedBasket.id, 
          basketData: {
            price: form.price ? parseFloat(form.price) : undefined,
            risk_rating: form.risk_rating || undefined,
            expected_roi_range: form.expected_roi_range || undefined,
            roi_to_date: form.roi_to_date ? parseFloat(form.roi_to_date) : undefined,
            image_base64: imageBase64 || undefined,
          }
        }));
      } else {
        // Create new basket
        if (selectedSongs.length === 0) {
          alert("Please select at least one song for the basket");
          return;
        }

        dispatch(createBasket({
          name: form.name,
          price: parseFloat(form.price),
          risk_rating: form.risk_rating || undefined,
          expected_roi_range: form.expected_roi_range || undefined,
          songs: selectedSongs,
          image_base64: imageBase64 || undefined,
        }));
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving basket:', error);
    }
  };

  // Delete Basket
  const handleDelete = () => {
    if (selectedBasket) {
      dispatch(deleteBasket(selectedBasket.id));
    }
    setDeleteOpen(false);
  };

  // Add Songs to Basket
  const handleAddSongs = () => {
    if (selectedBasket && selectedSongs.length > 0) {
      dispatch(addSongsToBasket({
        basketId: selectedBasket.id,
        songIds: selectedSongs
      }));
      setSelectedSongs([]);
      setSongsModalOpen(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Also set the base64 for preview
      convertImageToBase64(file).then(base64 => {
        setForm(prev => ({ ...prev, image_base64: base64 }));
      });
    }
  };

  // Format ROI display
  const formatROI = (roi: number) => {
    return `${roi}%`;
  };

  return (
    <div className="p-8 bg-[#111] min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🎵 Baskets Manager</h1>
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
            onClick={() => handleOpen()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow text-sm font-medium transition duration-200"
          >
            <Plus className="w-4 h-4" /> Add Basket
          </button>
        </div>
      </header>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-[#1b1b1b] rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-400 text-sm">Active filters:</span>
              {filters.name && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  Name: {filters.name}
                </span>
              )}
              {filters.risk_rating && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                  Risk: {filters.risk_rating}
                </span>
              )}
              {filters.minPrice && (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                  Min Price: ${filters.minPrice}
                </span>
              )}
              {filters.maxPrice && (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                  Max Price: ${filters.maxPrice}
                </span>
              )}
              {filters.minSongs && (
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                  Min Songs: {filters.minSongs}
                </span>
              )}
              {filters.maxSongs && (
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                  Max Songs: {filters.maxSongs}
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
        <div className="mb-4 p-4 bg-red-600 rounded-lg text-white text-sm shadow-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      )}

      {/* Baskets List */}
      <div className="space-y-6">
        {filteredBaskets.length === 0 && !loading ? (
          <div className="text-gray-400 italic text-center py-20">
            {hasActiveFilters ? "No baskets match your filters." : "No baskets yet. Add one to get started."}
          </div>
        ) : (
          filteredBaskets.map((basket) => (
            <div
              key={basket.id}
              className="bg-[#1b1b1b] rounded-xl shadow-lg border border-gray-800 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  {basket.image ? (
                    <img
                      src={basket.image}
                      alt={basket.name}
                      className="w-16 h-16 rounded object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                      <Layers className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-white">{basket.name}</h2>
                    <p className="text-gray-400 text-sm">
                      {basket.risk_rating && `Risk: ${basket.risk_rating}`}
                      {basket.expected_roi_range && ` • ROI Range: ${basket.expected_roi_range}`}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Price: ${basket.price}
                      {basket.roi_to_date && ` • ROI to Date: ${formatROI(basket.roi_to_date)}`}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {basket.songs?.length || 0} songs
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedBasket(basket);
                      setSongsModalOpen(true);
                    }}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition duration-200"
                  >
                    + Add Songs
                  </button>
                  <button
                    onClick={() => handleOpen(basket)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition duration-200"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBasket(basket);
                      setDeleteOpen(true);
                    }}
                    className="p-2 bg-red-700 hover:bg-red-600 rounded transition duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Songs inside basket */}
              {basket.songs?.length > 0 && (
                <div className="px-6 pb-6">
                  <h3 className="text-gray-300 font-medium mb-2">Songs in Basket</h3>
                  <div className="space-y-2">
                    {basket.songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between bg-[#222] rounded p-3 hover:bg-[#2a2a2a] transition duration-200"
                      >
                        <div className="flex items-center gap-3">
                          {song.image_url ? (
                            <img
                              src={song.image_url}
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover shadow"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                              <Music2 className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-white">{song.title}</p>
                            <p className="text-gray-400 text-xs">
                              {song.artist && `Artist: ${song.artist}`}
                              {song.album && ` • Album: ${song.album}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Filter Modal */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-xl font-bold text-white">
                Filter Baskets
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Name contains:</label>
                <input
                  type="text"
                  placeholder="Filter by basket name..."
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Risk Rating</label>
                <select
                  value={filters.risk_rating}
                  onChange={(e) => setFilters({ ...filters, risk_rating: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                >
                  <option value="">All Risk Ratings</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Songs</label>
                  <input
                    type="number"
                    placeholder="Min songs"
                    value={filters.minSongs}
                    onChange={(e) => setFilters({ ...filters, minSongs: e.target.value })}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Songs</label>
                  <input
                    type="number"
                    placeholder="Max songs"
                    value={filters.maxSongs}
                    onChange={(e) => setFilters({ ...filters, maxSongs: e.target.value })}
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

      {/* Add/Edit Basket Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {selectedBasket ? "Edit Basket" : "Add Basket"}
            </DialogTitle>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Basket Name *</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!selectedBasket}
                  disabled={!!selectedBasket} // Disable for edit mode
                />
              </div>
              <div>
                <label htmlFor="risk_rating" className="block text-sm font-medium text-gray-300 mb-1">Risk Rating</label>
                <select
                  id="risk_rating"
                  value={form.risk_rating}
                  onChange={(e) => setForm({ ...form, risk_rating: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Risk Rating</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="expected_roi_range" className="block text-sm font-medium text-gray-300 mb-1">Expected ROI Range (e.g., 10-15%)</label>
                <input
                  id="expected_roi_range"
                  type="text"
                  value={form.expected_roi_range}
                  onChange={(e) => setForm({ ...form, expected_roi_range: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Price *</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!selectedBasket}
                />
              </div>
              <div>
                <label htmlFor="roi_to_date" className="block text-sm font-medium text-gray-300 mb-1">ROI to Date (%)</label>
                <input
                  id="roi_to_date"
                  type="number"
                  step="0.01"
                  value={form.roi_to_date}
                  onChange={(e) => setForm({ ...form, roi_to_date: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">Basket Image</label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.image_base64 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                    <img
                      src={form.image_base64}
                      alt="Preview"
                      className="w-20 h-20 rounded object-cover shadow-md"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Songs for Basket</label>
                <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-800 p-2 rounded border border-gray-700">
                  {songs.map((song) => (
                    <label key={song.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSongs.includes(song.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSongs([...selectedSongs, song.id]);
                          } else {
                            setSelectedSongs(selectedSongs.filter(id => id !== song.id));
                          }
                        }}
                        className="rounded bg-gray-700"
                      />
                      <span className="text-sm text-white">
                        {song.title} {song.artist && `- ${song.artist}`}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedSongs.length > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    {selectedSongs.length} song(s) selected
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm font-medium transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium transition duration-200"
                disabled={!selectedBasket ? !form.name || !form.price || selectedSongs.length === 0 : false}
              >
                Save
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Add Songs to Basket Modal */}
      <Dialog open={songsModalOpen} onClose={() => setSongsModalOpen(false)} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              Add Songs to {selectedBasket?.name}
            </DialogTitle>
            <div className="space-y-3">
              {songs.map((song) => (
                <label key={song.id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded transition duration-200">
                  <input
                    type="checkbox"
                    checked={selectedSongs.includes(song.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSongs([...selectedSongs, song.id]);
                      } else {
                        setSelectedSongs(selectedSongs.filter(id => id !== song.id));
                      }
                    }}
                    className="rounded bg-gray-700"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {song.image_url ? (
                      <img
                        src={song.image_url}
                        alt={song.title}
                        className="w-8 h-8 rounded object-cover shadow"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                        <Music2 className="w-3 h-3" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm text-white">{song.title}</p>
                      <p className="text-gray-400 text-xs">{song.artist}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSongsModalOpen(false);
                  setSelectedSongs([]);
                }}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm font-medium transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSongs}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-sm font-medium transition duration-200"
                disabled={selectedSongs.length === 0}
              >
                Add Songs
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-md">
            <DialogTitle className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              Delete Basket
            </DialogTitle>
            <p className="mb-6 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedBasket?.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm font-medium transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-sm font-medium transition duration-200"
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