'use client'

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Trash2, X, Download, RefreshCcw } from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { 
  fetchAllTransactions, 
  updateTransactionStatus,
  deleteProof,
  clearError 
} from '../../slices/transactionSlice';
import { RootState, AppDispatch } from '../../store';

interface Transaction {
  id: number;
  wallet_id: number;
  user_id: number;
  kind: 'deposit' | 'withdraw';
  type: 'credit' | 'debit';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  network?: string;
  proof_url?: string;
  withdrawal_details?: any;
  admin_notes?: string;
  meta?: any;
  reference: string;
  processed_at?: string;
  processed_by?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  wallet?: {
    id: number;
    available_balance: string;
    total_balance: string;
  };
  processedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function PortfolioDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading, error } = useSelector((state: RootState) => state.transactions);
  
  const [selectedDeposit, setSelectedDeposit] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [adminNotes, setAdminNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<Transaction | null>(null);

  // Filter for deposits only
  const deposits = Array.isArray(transactions) 
    ? transactions.filter((transaction: Transaction) => transaction.kind === 'deposit')
    : [];

  useEffect(() => {
    const loadDeposits = async () => {
      try {
        await dispatch(fetchAllTransactions({ kind: 'deposit' })).unwrap();
      } catch (error: any) {
        console.error('Failed to load deposits:', error);
        setLocalError(error || 'Failed to load deposits');
      }
    };
    
    loadDeposits();
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setLocalError(null);
    };
  }, [dispatch]);

  // Open view modal
  const handleView = (deposit: Transaction) => {
    setSelectedDeposit(deposit);
    setNewStatus(deposit.status);
    setAdminNotes(deposit.admin_notes || "");
    setModalOpen(true);
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!selectedDeposit) return;

    try {
      await dispatch(updateTransactionStatus({
        id: selectedDeposit.id,
        statusData: {
          status: newStatus,
          admin_notes: adminNotes
        }
      })).unwrap();
      
      setModalOpen(false);
      // Refresh the transactions list
      await dispatch(fetchAllTransactions({ kind: 'deposit' })).unwrap();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      setLocalError(error || 'Failed to update transaction status');
    }
  };

  // Open delete proof modal
  const handleDeleteProof = (deposit: Transaction) => {
    setDepositToDelete(deposit);
    setDeleteModalOpen(true);
  };

  // Confirm proof deletion
  const confirmDeleteProof = async () => {
    if (!depositToDelete) return;

    try {
      await dispatch(deleteProof(depositToDelete.id)).unwrap();
      setDeleteModalOpen(false);
      setDepositToDelete(null);
      // Refresh the transactions list
      await dispatch(fetchAllTransactions({ kind: 'deposit' })).unwrap();
    } catch (error: any) {
      console.error('Failed to delete proof:', error);
      setLocalError(error || 'Failed to delete proof');
    }
  };

  // Refresh transactions
  const handleRefresh = async () => {
    try {
      await dispatch(fetchAllTransactions({ kind: 'deposit' })).unwrap();
      setLocalError(null);
    } catch (error: any) {
      console.error('Refresh failed:', error);
      setLocalError(error || 'Failed to refresh deposits');
    }
  };

  // Download proof image
  const handleDownloadProof = (deposit: Transaction) => {
    if (!deposit.proof_url) {
      alert('No proof available for download');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = deposit.proof_url;
      link.download = `proof-${deposit.reference}.${deposit.proof_url.includes('pdf') ? 'pdf' : 'png'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download proof:', error);
      alert('Failed to download proof. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-600 text-yellow-100",
      completed: "bg-green-600 text-green-100", 
      failed: "bg-red-600 text-red-100"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      pending: "Pending",
      completed: "Completed",
      failed: "Failed"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // Format amount with currency
  const formatAmount = (amount: string) => {
    try {
      const numericAmount = parseFloat(amount);
      return `$${numericAmount.toFixed(2)}`;
    } catch (error) {
      return amount;
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch(clearError());
    setLocalError(null);
  };

  return (
    <div className="">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Deposits Management</h1>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Error Display */}
      {(error || localError) && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500 rounded-lg p-4 flex justify-between items-center">
          <p className="text-red-500">{error || localError}</p>
          <button 
            onClick={clearErrors}
            className="text-red-500 hover:text-red-400 ml-4"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6 space-y-6">
        <div className="bg-[#222629] rounded-2xl shadow p-6 min-h-screen">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <span className="ml-3 text-gray-400">Loading deposits...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method/Network</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proof</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1b1d1f] divide-y divide-gray-700">
                  {deposits.map((deposit: Transaction) => (
                    <tr key={deposit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(deposit.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deposit.reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {deposit.user ? (
                          <div>
                            <div className="font-medium">{deposit.user.name || 'Unknown User'}</div>
                            <div className="text-gray-400 text-xs">{deposit.user.email || 'No email'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {deposit.network ? deposit.network.toUpperCase() : (deposit.method || 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatAmount(deposit.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(deposit.status)}`}>
                          {getStatusDisplay(deposit.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {deposit.proof_url ? (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleDownloadProof(deposit)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Download Proof"
                            >
                              <Download size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProof(deposit)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Proof"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No proof</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                        <button 
                          onClick={() => handleView(deposit)} 
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white flex items-center space-x-1 transition-all duration-200"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {deposits.length === 0 && !loading && (
                <div className="flex flex-col justify-center items-center text-gray-400 space-y-2 mt-10">
                  <div className="text-6xl mb-4">💸</div>
                  <span>No deposit transactions found</span>
                  <p className="text-sm text-gray-500">When users make deposits, they will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Proof Modal */}
      <Dialog open={deleteModalOpen} onClose={setDeleteModalOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1f2225] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle className="text-lg font-semibold text-white">Delete Payment Proof</DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    Are you sure you want to delete the payment proof for deposit {depositToDelete?.reference}? 
                    This action cannot be undone and the user will need to re-upload proof.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
              <button
                onClick={confirmDeleteProof}
                className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 sm:w-auto"
              >
                Delete Proof
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
          <div className="bg-[#1f2225] rounded-3xl shadow-2xl p-6 w-full max-w-2xl transform transition-transform duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Deposit Details - {selectedDeposit.reference}</h2>
              <button className="text-gray-400 hover:text-white transition" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deposit Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Transaction Information</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(selectedDeposit.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Reference:</span>
                    <span className="font-mono">{selectedDeposit.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Method:</span>
                    <span>{selectedDeposit.network ? selectedDeposit.network.toUpperCase() : (selectedDeposit.method || 'N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-semibold">{formatAmount(selectedDeposit.amount)}</span>
                  </div>
                  {selectedDeposit.user && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">User:</span>
                        <span>{selectedDeposit.user.name || 'Unknown User'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{selectedDeposit.user.email || 'No email'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Status Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as 'pending' | 'completed' | 'failed')}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this transaction..."
                      rows={3}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Image Section */}
            {selectedDeposit.proof_url && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4">Payment Proof</h3>
                <div className="flex justify-center">
                  {selectedDeposit.proof_url.includes('pdf') ? (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-gray-300 mb-2">PDF Proof Document</p>
                      <button 
                        onClick={() => handleDownloadProof(selectedDeposit)}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center space-x-2"
                      >
                        <Download size={16} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  ) : (
                    <img 
                      src={selectedDeposit.proof_url} 
                      alt="Payment proof" 
                      className="max-w-full max-h-64 rounded-lg border border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="bg-gray-800 p-4 rounded-lg text-center">
                              <p class="text-gray-300 mb-2">Proof image unavailable</p>
                              <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center space-x-2 mx-auto">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <span>Download Proof</span>
                              </button>
                            </div>
                          `;
                          parent.querySelector('button')?.addEventListener('click', () => handleDownloadProof(selectedDeposit));
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={handleUpdateStatus} 
                className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl text-white font-semibold transition-colors"
              >
                Update Status
              </button>
              <button 
                onClick={() => setModalOpen(false)} 
                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-xl text-white font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}