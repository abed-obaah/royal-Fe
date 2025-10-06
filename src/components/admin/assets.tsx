'use client'

import React, { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Trash2, Pencil, X } from "lucide-react";

export default function AssetsTable() {
  const [assets, setAssets] = useState([]);
  const [songs, setSongs] = useState([]);
  const [baskets, setBaskets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
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
    song_id: null,
    basket_id: null,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchAssets();
    fetchSongs();
    fetchBaskets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/assets?per_page=100');
      const data = await response.json();
      setAssets(data.data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await fetch('/songs?per_page=100'); // Assuming /songs endpoint exists
      const data = await response.json();
      setSongs(data.data || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const fetchBaskets = async () => {
    try {
      const response = await fetch('/baskets?per_page=100'); // Assuming /baskets endpoint exists
      const data = await response.json();
      setBaskets(data.data || []);
    } catch (error) {
      console.error('Error fetching baskets:', error);
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Open add/edit modal
  const openModal = (asset = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setFormData({
        title: asset.title || "",
        slug: asset.slug || "",
        type: asset.type || "single",
        artist: asset.artist || "",
        genre: asset.genre || "",
        price: asset.price || "",
        expected_roi_percent: asset.expected_roi_percent || "",
        current_roi_percent: asset.current_roi_percent || "",
        total_shares: asset.total_shares || "",
        available_shares: asset.available_shares || "",
        status: asset.status || "active",
        song_id: asset.song_id || null,
        basket_id: asset.basket_id || null,
      });
      setImageFile(null);
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
        song_id: null,
        basket_id: null,
      });
      setImageFile(null);
    }
    setModalOpen(true);
  };

  // Save asset (add or edit)
  const handleSave = async () => {
    let payload = { ...formData };
    payload.price = parseFloat(formData.price) || 0;
    payload.expected_roi_percent = parseFloat(formData.expected_roi_percent) || null;
    payload.current_roi_percent = parseFloat(formData.current_roi_percent) || null;
    payload.total_shares = parseInt(formData.total_shares) || 0;
    payload.available_shares = parseInt(formData.available_shares) || payload.total_shares;
    if (!payload.song_id) payload.song_id = null;
    if (!payload.basket_id) payload.basket_id = null;

    if (imageFile) {
      try {
        const base64 = await getBase64(imageFile);
        payload.image_base64 = base64;
        payload.image_filename = imageFile.name;
      } catch (error) {
        console.error('Error reading image:', error);
        return;
      }
    }

    try {
      let response;
      if (selectedAsset) {
        // Edit
        response = await fetch(`/assets/${selectedAsset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Add
        response = await fetch('/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (response.ok) {
        fetchAssets();
        setModalOpen(false);
      } else {
        console.error('Error saving asset:', await response.text());
      }
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  // Open delete modal
  const handleDelete = (asset) => {
    setSelectedAsset(asset);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/assets/${selectedAsset.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAssets();
        setDeleteModalOpen(false);
      } else {
        console.error('Error deleting asset:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Assets</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
        >
          Add Asset
        </button>
      </div>

      {/* Assets Table */}
      <div className="bg-[#222629] rounded-2xl shadow p-4 overflow-x-auto">
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
          <tbody className="bg-[#1b1d1f] divide-y divide-gray-700">
            {assets.map(asset => (
              <tr key={asset.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={asset.image_url || "https://via.placeholder.com/60"} alt={asset.title} className="w-12 h-12 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.artist || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.genre || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">${asset.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.expected_roi_percent ? `${asset.expected_roi_percent}%` : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.current_roi_percent ? `${asset.current_roi_percent}%` : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.total_shares}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.available_shares}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}</td>
                <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                  <button onClick={() => openModal(asset)} className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-white flex items-center space-x-1">
                    <Pencil size={16} /> <span>Edit</span>
                  </button>
                  <button onClick={() => handleDelete(asset)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white flex items-center space-x-1">
                    <Trash2 size={16} /> <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {assets.length === 0 && (
          <div className="flex flex-col justify-center items-center text-gray-400 space-y-2 mt-10">
            <img src="https://via.placeholder.com/150" alt="No data" className="w-60 h-60" />
            <span>No assets added</span>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1f2225] rounded-3xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-xl font-bold text-white">{selectedAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
              <button className="text-gray-400 hover:text-white" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3 text-gray-300">
              <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="text" placeholder="Slug (optional)" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, song_id: e.target.value === 'basket' ? null : formData.song_id, basket_id: e.target.value === 'single' ? null : formData.basket_id })} className="w-full px-3 py-2 rounded bg-gray-800 text-white">
                <option value="single">Single</option>
                <option value="basket">Basket</option>
              </select>
              {formData.type === 'single' && (
                <select value={formData.song_id || ''} onChange={e => setFormData({ ...formData, song_id: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-3 py-2 rounded bg-gray-800 text-white">
                  <option value="">Select Song</option>
                  {songs.map(song => (
                    <option key={song.id} value={song.id}>{song.title || song.name}</option>
                  ))}
                </select>
              )}
              {formData.type === 'basket' && (
                <select value={formData.basket_id || ''} onChange={e => setFormData({ ...formData, basket_id: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-3 py-2 rounded bg-gray-800 text-white">
                  <option value="">Select Basket</option>
                  {baskets.map(basket => (
                    <option key={basket.id} value={basket.id}>{basket.title || basket.name}</option>
                  ))}
                </select>
              )}
              <input type="text" placeholder="Artist (optional)" value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="text" placeholder="Genre (optional)" value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="number" placeholder="Expected ROI Percent (optional)" value={formData.expected_roi_percent} onChange={e => setFormData({ ...formData, expected_roi_percent: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="number" placeholder="Current ROI Percent (optional)" value={formData.current_roi_percent} onChange={e => setFormData({ ...formData, current_roi_percent: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="number" placeholder="Total Shares" value={formData.total_shares} onChange={e => setFormData({ ...formData, total_shares: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="number" placeholder="Available Shares (optional)" value={formData.available_shares} onChange={e => setFormData({ ...formData, available_shares: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {selectedAsset && selectedAsset.image_url && (
                <div>
                  <label>Current Image</label>
                  <img src={selectedAsset.image_url} alt="Current" className="w-32 h-32 rounded" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl text-white font-semibold">{selectedAsset ? "Update" : "Add"}</button>
              <button onClick={() => setModalOpen(false)} className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-xl text-white font-semibold">Cancel</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1f2225] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle className="text-lg font-semibold text-white">Delete Asset</DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">Are you sure you want to delete this asset? This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
              <button onClick={confirmDelete} className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 sm:w-auto">Delete</button>
              <button onClick={() => setDeleteModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 sm:mt-0 sm:w-auto">Cancel</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}