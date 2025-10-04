'use client'

import React, { useState } from "react";
import { Eye, Trash2, X } from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function PortfolioDashboard() {
  const [deposits, setDeposits] = useState([
    { id: 1, date: "2025-09-14", reference: "REF123456", method: "Bank Transfer", type: "Credit", amount: "$500", status: "Completed" },
    { id: 2, date: "2025-09-13", reference: "REF654321", method: "Card", type: "Debit", amount: "$200", status: "Pending" },
    { id: 3, date: "2025-09-12", reference: "REF789012", method: "PayPal", type: "Credit", amount: "$750", status: "Completed" },
  ]);

  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState(null);

  // Open view modal
  const handleView = (deposit) => {
    setSelectedDeposit(deposit);
    setNewStatus(deposit.status);
    setModalOpen(true);
  };

  // Update status
  const handleUpdateStatus = () => {
    setDeposits(prev => prev.map(d => d.id === selectedDeposit.id ? { ...d, status: newStatus } : d));
    setModalOpen(false);
  };

  // Open delete modal
  const handleDelete = (deposit) => {
    setDepositToDelete(deposit);
    setDeleteModalOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    setDeposits(prev => prev.filter(d => d.id !== depositToDelete.id));
    setDeleteModalOpen(false);
  };

  return (
    <div className="">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Withdraws</h1>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        <div className="bg-[#222629] rounded-2xl shadow p-6 min-h-screen">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1b1d1f] divide-y divide-gray-700">
                {deposits.map(deposit => (
                  <tr key={deposit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deposit.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deposit.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deposit.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deposit.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deposit.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${deposit.status === "Completed" ? "bg-green-600 text-green-100" : deposit.status === "Pending" ? "bg-yellow-600 text-yellow-100" : "bg-red-600 text-red-100"}`}>{deposit.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                      <button onClick={() => handleView(deposit)} className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white flex items-center space-x-1 transition-all duration-200">
                        <Eye size={16} /><span>View</span>
                      </button>
                      <button onClick={() => handleDelete(deposit)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white flex items-center space-x-1 transition-all duration-200">
                        <Trash2 size={16} /><span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {deposits.length === 0 && (
              <div className="flex flex-col justify-center items-center text-gray-400 space-y-2 mt-10">
                <img src="https://testapp.artsplit.com/images/empty.svg" alt="No data" className="w-60 h-60" />
                <span>No data</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onClose={setDeleteModalOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1f2225] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle className="text-lg font-semibold text-white">Delete Deposit</DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    Are you sure you want to delete this deposit? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
              <button
                onClick={confirmDelete}
                className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 sm:w-auto"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* View/Update Status Modal */}
      {modalOpen && selectedDeposit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1f2225] rounded-3xl shadow-2xl p-6 w-96 transform transition-transform duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Deposit Details</h2>
              <button className="text-gray-400 hover:text-white transition" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 text-gray-300">
              {['date', 'reference', 'method', 'type', 'amount'].map((field) => (
                <div className="flex justify-between" key={field}>
                  <span className="font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}:</span>
                  <span>{selectedDeposit[field]}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-1 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={handleUpdateStatus} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl text-white font-semibold">Save</button>
              <button onClick={() => setModalOpen(false)} className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-xl text-white font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
