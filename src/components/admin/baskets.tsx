"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Plus, Pencil, Trash2, Music2, Layers } from "lucide-react";

export default function AssetsDashboard() {
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [songsModalOpen, setSongsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [form, setForm] = useState({
    name: "",
    risk: "",
    roiRange: "",
    type: "Single",
    price: "",
    roiToDate: "",
    image: "",
  });

  // Modal to add song into a basket
  const [songForm, setSongForm] = useState({
    name: "",
    price: "",
    roiToDate: "",
    image: "",
  });

  // Open Add/Edit Asset
  const handleOpen = (asset = null) => {
    if (asset) {
      setForm(asset);
      setSelectedAsset(asset);
    } else {
      setForm({
        name: "",
        risk: "",
        roiRange: "",
        type: "Single",
        price: "",
        roiToDate: "",
        image: "",
      });
      setSelectedAsset(null);
    }
    setOpen(true);
  };

  // Save Asset
  const handleSave = () => {
    if (selectedAsset) {
      setAssets(
        assets.map((a) =>
          a === selectedAsset ? { ...form, id: selectedAsset.id, songs: a.songs || [] } : a
        )
      );
    } else {
      setAssets([...assets, { ...form, id: Date.now(), songs: [] }]);
    }
    setOpen(false);
  };

  // Delete Asset
  const handleDelete = () => {
    setAssets(assets.filter((a) => a !== selectedAsset));
    setDeleteOpen(false);
  };

  // Add Song into a basket
  const handleAddSong = () => {
    setAssets(
      assets.map((a) =>
        a === selectedAsset
          ? {
              ...a,
              songs: [
                ...(a.songs || []),
                { ...songForm, id: Date.now(), type: "Single" },
              ],
            }
          : a
      )
    );
    setSongForm({ name: "", price: "", roiToDate: "", image: "" });
    setSongsModalOpen(false);
  };

  return (
    <div className="p-8 bg-[#111] min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🎵 Assets Manager</h1>
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </header>

      {/* Assets List */}
      <div className="space-y-6">
        {assets.length === 0 ? (
          <div className="text-gray-400 italic text-center py-20">
            No assets yet. Add one to get started.
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#1b1b1b] rounded-xl shadow border border-gray-800"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  {asset.image ? (
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                      {asset.type === "Basket" ? (
                        <Layers className="w-6 h-6" />
                      ) : (
                        <Music2 className="w-6 h-6" />
                      )}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{asset.name}</h2>
                    <p className="text-gray-400 text-sm">
                      {asset.type} • Risk: {asset.risk} • ROI Range:{" "}
                      {asset.roiRange}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Price: ${asset.price} • ROI to Date: {asset.roiToDate}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {asset.type === "Basket" && (
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        setSongsModalOpen(true);
                      }}
                      className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-sm"
                    >
                      + Add Song
                    </button>
                  )}
                  <button
                    onClick={() => handleOpen(asset)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAsset(asset);
                      setDeleteOpen(true);
                    }}
                    className="p-2 bg-red-700 hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Songs inside basket */}
              {asset.type === "Basket" && asset.songs?.length > 0 && (
                <div className="px-6 pb-6">
                  <h3 className="text-gray-300 font-medium mb-2">
                    Songs in Basket
                  </h3>
                  <div className="space-y-2">
                    {asset.songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between bg-[#222] rounded p-3"
                      >
                        <div className="flex items-center gap-3">
                          {song.image ? (
                            <img
                              src={song.image}
                              alt={song.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                              <Music2 className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{song.name}</p>
                            <p className="text-gray-400 text-xs">
                              Price: ${song.price} • ROI: {song.roiToDate}%
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

      {/* Add/Edit Asset Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-lg">
            <DialogTitle className="text-lg font-semibold mb-4">
              {selectedAsset ? "Edit Asset" : "Add Asset"}
            </DialogTitle>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="text"
                placeholder="Risk Rating"
                value={form.risk}
                onChange={(e) => setForm({ ...form, risk: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="text"
                placeholder="Expected ROI Range"
                value={form.roiRange}
                onChange={(e) => setForm({ ...form, roiRange: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white"
              >
                <option value="Single">Single</option>
                <option value="Basket">Basket</option>
              </select>
              <input
                type="number"
                placeholder="Price (Entry Point)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="number"
                placeholder="ROI to Date (%)"
                value={form.roiToDate}
                onChange={(e) =>
                  setForm({ ...form, roiToDate: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
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
              >
                Save
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Add Song Modal */}
      <Dialog open={songsModalOpen} onClose={setSongsModalOpen}>
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1e1e1e] text-white rounded-xl p-6 w-full max-w-md">
            <DialogTitle className="text-lg font-semibold mb-4">
              Add Song to {selectedAsset?.name}
            </DialogTitle>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Song Name"
                value={songForm.name}
                onChange={(e) =>
                  setSongForm({ ...songForm, name: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="number"
                placeholder="Price"
                value={songForm.price}
                onChange={(e) =>
                  setSongForm({ ...songForm, price: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="number"
                placeholder="ROI to Date (%)"
                value={songForm.roiToDate}
                onChange={(e) =>
                  setSongForm({ ...songForm, roiToDate: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={songForm.image}
                onChange={(e) =>
                  setSongForm({ ...songForm, image: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSongsModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSong}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
              >
                Add Song
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
              Delete Asset
            </DialogTitle>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedAsset?.name}</span>? This
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
