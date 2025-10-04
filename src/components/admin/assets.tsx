'use client'

import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Trash2, Pencil, X } from "lucide-react";

export default function AssetsTable() {
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Song A",
      risk: "Medium",
      roiRange: "5-10%",
      type: "Single",
      price: "$100",
      roiToDate: "$20",
      image: "https://via.placeholder.com/60",
    },
    {
      id: 2,
      name: "Album B",
      risk: "High",
      roiRange: "10-20%",
      type: "Basket",
      price: "$500",
      roiToDate: "$80",
      image: "https://via.placeholder.com/60",
    },
  ]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    risk: "",
    roiRange: "",
    type: "Single",
    price: "",
    roiToDate: "",
    image: "",
  });

  // Open add/edit modal
  const openModal = (asset = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setFormData(asset);
    } else {
      setSelectedAsset(null);
      setFormData({
        name: "",
        risk: "",
        roiRange: "",
        type: "Single",
        price: "",
        roiToDate: "",
        image: "",
      });
    }
    setModalOpen(true);
  };

  // Save asset (add or edit)
  const handleSave = () => {
    if (selectedAsset) {
      // Edit
      setAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...formData, id: selectedAsset.id } : a));
    } else {
      // Add
      const newAsset = { ...formData, id: Date.now() };
      setAssets(prev => [...prev, newAsset]);
    }
    setModalOpen(false);
  };

  // Open delete modal
  const handleDelete = (asset) => {
    setSelectedAsset(asset);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setAssets(prev => prev.filter(a => a.id !== selectedAsset.id));
    setDeleteModalOpen(false);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk / ROI Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ROI to Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#1b1d1f] divide-y divide-gray-700">
            {assets.map(asset => (
              <tr key={asset.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.risk} / {asset.roiRange}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{asset.roiToDate}</td>
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
          <DialogPanel className="bg-[#1f2225] rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-xl font-bold text-white">{selectedAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
              <button className="text-gray-400 hover:text-white" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3 text-gray-300">
              <input type="text" placeholder="Song/Album/Basket Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="text" placeholder="Risk Rating" value={formData.risk} onChange={e => setFormData({ ...formData, risk: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="text" placeholder="Expected ROI Range" value={formData.roiRange} onChange={e => setFormData({ ...formData, roiRange: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white">
                <option value="Single">Single</option>
                <option value="Basket">Basket</option>
              </select>
              <input type="text" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="text" placeholder="ROI to Date" value={formData.roiToDate} onChange={e => setFormData({ ...formData, roiToDate: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
              <input type="text" placeholder="Image URL" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
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
