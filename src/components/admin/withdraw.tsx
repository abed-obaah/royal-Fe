'use client'

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Trash2, X, RefreshCcw, FileText, BarChart3, Download } from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { 
  fetchAllTransactions, 
  updateTransactionStatus,
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
  withdrawal_details?: {
    account_number?: string;
    bank_name?: string;
    account_name?: string;
    wallet_address?: string;
    network?: string;
  };
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

interface ReportFilters {
  startDate: string;
  endDate: string;
  status: string;
  method: string;
  minAmount: string;
  maxAmount: string;
}

export default function WithdrawsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading, error } = useSelector((state: RootState) => state.transactions);
  
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [adminNotes, setAdminNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<Transaction | null>(null);

  // Report generation states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    status: 'all',
    method: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  // Filter for withdrawals only
  const withdrawals = transactions.filter((transaction: Transaction) => transaction.kind === 'withdraw');

  useEffect(() => {
    dispatch(fetchAllTransactions({ kind: 'withdraw' }));
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setLocalError(null);
    };
  }, [dispatch]);

  // Open view modal
  const handleView = (withdrawal: Transaction) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setAdminNotes(withdrawal.admin_notes || "");
    setModalOpen(true);
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!selectedWithdrawal) return;

    try {
      await dispatch(updateTransactionStatus({
        id: selectedWithdrawal.id,
        statusData: {
          status: newStatus,
          admin_notes: adminNotes
        }
      })).unwrap();
      
      setModalOpen(false);
      // Refresh the transactions list
      dispatch(fetchAllTransactions({ kind: 'withdraw' }));
    } catch (error: any) {
      console.error('Failed to update status:', error);
      setLocalError(error || 'Failed to update withdrawal status');
    }
  };

  // Open delete modal
  const handleDelete = (withdrawal: Transaction) => {
    setWithdrawalToDelete(withdrawal);
    setDeleteModalOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!withdrawalToDelete) return;

    try {
      // Note: We don't have a delete transaction endpoint, so we'll just update status to failed
      await dispatch(updateTransactionStatus({
        id: withdrawalToDelete.id,
        statusData: {
          status: 'failed',
          admin_notes: 'Transaction deleted by admin'
        }
      })).unwrap();
      
      setDeleteModalOpen(false);
      setWithdrawalToDelete(null);
      // Refresh the transactions list
      dispatch(fetchAllTransactions({ kind: 'withdraw' }));
    } catch (error: any) {
      console.error('Failed to delete withdrawal:', error);
      setLocalError(error || 'Failed to delete withdrawal');
    }
  };

  // Refresh transactions
  const handleRefresh = () => {
    dispatch(fetchAllTransactions({ kind: 'withdraw' }));
  };

  // Report Generation Functions
  const generateCSVReport = (filteredWithdrawals: Transaction[]) => {
    const headers = [
      'Reference',
      'Date',
      'User Name',
      'User Email',
      'Method',
      'Details',
      'Amount (USD)',
      'Status',
      'Admin Notes',
      'Processed At',
      'Created At'
    ];

    const csvData = filteredWithdrawals.map(withdrawal => [
      withdrawal.reference,
      formatDate(withdrawal.created_at),
      withdrawal.user?.name || 'N/A',
      withdrawal.user?.email || 'N/A',
      getWithdrawalMethod(withdrawal),
      getWithdrawalDetails(withdrawal),
      formatAmount(withdrawal.amount).replace('$', ''),
      getStatusDisplay(withdrawal.status),
      withdrawal.admin_notes || '',
      withdrawal.processed_at ? formatDate(withdrawal.processed_at) : 'Not Processed',
      formatDate(withdrawal.created_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const generatePDFReport = async (filteredWithdrawals: Transaction[]) => {
    // Simple PDF generation using browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF report');
      return;
    }

    const reportData = generateReportData(filteredWithdrawals);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Withdrawals Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
          .summary-item { text-align: center; padding: 10px; }
          .summary-value { font-size: 24px; font-weight: bold; color: #333; }
          .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .status-completed { color: green; }
          .status-pending { color: orange; }
          .status-failed { color: red; }
          .method-bank { background-color: #e8f4fd; }
          .method-crypto { background-color: #f0f8f0; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Withdrawals Management Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          <p>Period: ${reportFilters.startDate || 'All time'} to ${reportFilters.endDate || 'Present'}</p>
        </div>

        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${reportData.summary.totalWithdrawals}</div>
              <div class="summary-label">Total Withdrawals</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">$${reportData.summary.totalAmount.toFixed(2)}</div>
              <div class="summary-label">Total Amount</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">$${reportData.summary.averageAmount.toFixed(2)}</div>
              <div class="summary-label">Average Withdrawal</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportData.summary.completedCount}</div>
              <div class="summary-label">Completed</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportData.summary.pendingCount}</div>
              <div class="summary-label">Pending</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportData.summary.failedCount}</div>
              <div class="summary-label">Failed</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportData.summary.bankCount}</div>
              <div class="summary-label">Bank Transfers</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportData.summary.cryptoCount}</div>
              <div class="summary-label">Crypto</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Date</th>
              <th>User</th>
              <th>Method</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Admin Notes</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.withdrawals.map(withdrawal => `
              <tr class="method-${withdrawal.method}">
                <td>${withdrawal.reference}</td>
                <td>${formatDate(withdrawal.created_at)}</td>
                <td>${withdrawal.user?.name || 'N/A'}</td>
                <td>${getWithdrawalMethod(withdrawal)}</td>
                <td>${getWithdrawalDetails(withdrawal)}</td>
                <td>${formatAmount(withdrawal.amount)}</td>
                <td class="status-${withdrawal.status}">${getStatusDisplay(withdrawal.status)}</td>
                <td>${withdrawal.admin_notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Report generated by Withdrawals Management System</p>
          <p>Total records: ${reportData.withdrawals.length}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const generateReportData = (filteredWithdrawals: Transaction[]) => {
    const totalAmount = filteredWithdrawals.reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0);
    const completedCount = filteredWithdrawals.filter(w => w.status === 'completed').length;
    const pendingCount = filteredWithdrawals.filter(w => w.status === 'pending').length;
    const failedCount = filteredWithdrawals.filter(w => w.status === 'failed').length;
    const bankCount = filteredWithdrawals.filter(w => w.method === 'bank').length;
    const cryptoCount = filteredWithdrawals.filter(w => w.method === 'crypto').length;

    return {
      summary: {
        totalWithdrawals: filteredWithdrawals.length,
        totalAmount,
        averageAmount: filteredWithdrawals.length > 0 ? totalAmount / filteredWithdrawals.length : 0,
        completedCount,
        pendingCount,
        failedCount,
        bankCount,
        cryptoCount
      },
      withdrawals: filteredWithdrawals
    };
  };

  const handleGenerateReport = async (format: 'csv' | 'pdf') => {
    setGeneratingReport(true);
    
    try {
      // Apply filters to withdrawals
      let filteredWithdrawals = [...withdrawals];

      // Date filter
      if (reportFilters.startDate) {
        filteredWithdrawals = filteredWithdrawals.filter(withdrawal => 
          new Date(withdrawal.created_at) >= new Date(reportFilters.startDate)
        );
      }
      if (reportFilters.endDate) {
        filteredWithdrawals = filteredWithdrawals.filter(withdrawal => 
          new Date(withdrawal.created_at) <= new Date(reportFilters.endDate + 'T23:59:59')
        );
      }

      // Status filter
      if (reportFilters.status !== 'all') {
        filteredWithdrawals = filteredWithdrawals.filter(withdrawal => 
          withdrawal.status === reportFilters.status
        );
      }

      // Method filter
      if (reportFilters.method !== 'all') {
        filteredWithdrawals = filteredWithdrawals.filter(withdrawal => 
          withdrawal.method === reportFilters.method
        );
      }

      // Amount filters
      if (reportFilters.minAmount) {
        filteredWithdrawals = filteredWithdrawals.filter(withdrawal => 
          parseFloat(withdrawal.amount) >= parseFloat(reportFilters.minAmount)
        );
      }
      if (reportFilters.maxAmount) {
        filteredWithdrawals = filteredWithdrawals.filter(withdrawal => 
          parseFloat(withdrawal.amount) <= parseFloat(reportFilters.maxAmount)
        );
      }

      if (filteredWithdrawals.length === 0) {
        alert('No withdrawals match the selected filters.');
        setGeneratingReport(false);
        return;
      }

      if (format === 'csv') {
        const csvContent = generateCSVReport(filteredWithdrawals);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `withdrawals-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        await generatePDFReport(filteredWithdrawals);
      }

      setReportModalOpen(false);
      alert(`Report generated successfully with ${filteredWithdrawals.length} records.`);

    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const resetReportFilters = () => {
    setReportFilters({
      startDate: '',
      endDate: '',
      status: 'all',
      method: 'all',
      minAmount: '',
      maxAmount: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Get withdrawal method details
  const getWithdrawalMethod = (withdrawal: Transaction) => {
    if (withdrawal.method === 'bank') {
      return 'Bank Transfer';
    } else if (withdrawal.method === 'crypto') {
      return `Crypto - ${withdrawal.network?.toUpperCase() || 'Unknown'}`;
    }
    return withdrawal.method || 'Unknown';
  };

  // Get withdrawal details for display
  const getWithdrawalDetails = (withdrawal: Transaction) => {
    if (!withdrawal.withdrawal_details) return 'N/A';
    
    if (withdrawal.method === 'bank') {
      const details = withdrawal.withdrawal_details;
      return `${details.bank_name} - ${details.account_number}`;
    } else if (withdrawal.method === 'crypto') {
      const details = withdrawal.withdrawal_details;
      return `${details.network} - ${details.wallet_address?.substring(0, 8)}...`;
    }
    
    return 'N/A';
  };

  // Get unique methods for filter
  const uniqueMethods = Array.from(new Set(
    withdrawals.map(w => w.method).filter(Boolean)
  ));

  // Clear errors
  const clearErrors = () => {
    dispatch(clearError());
    setLocalError(null);
  };

  return (
    <div className="">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Withdrawals</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setReportModalOpen(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <BarChart3 size={18} />
            <span>Generate Report</span>
          </button>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
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
          {loading && withdrawals.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <span className="ml-3 text-gray-400">Loading withdrawals...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1b1d1f] divide-y divide-gray-700">
                  {withdrawals.map((withdrawal: Transaction) => (
                    <tr key={withdrawal.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(withdrawal.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{withdrawal.reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {withdrawal.user ? (
                          <div>
                            <div className="font-medium">{withdrawal.user.name || 'Unknown User'}</div>
                            <div className="text-gray-400 text-xs">{withdrawal.user.email || 'No email'}</div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getWithdrawalMethod(withdrawal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getWithdrawalDetails(withdrawal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatAmount(withdrawal.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(withdrawal.status)}`}>
                          {getStatusDisplay(withdrawal.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                        <button 
                          onClick={() => handleView(withdrawal)} 
                          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white flex items-center space-x-1 transition-all duration-200"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(withdrawal)} 
                          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white flex items-center space-x-1 transition-all duration-200"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {withdrawals.length === 0 && !loading && (
                <div className="flex flex-col justify-center items-center text-gray-400 space-y-2 mt-10">
                  <img src="https://testapp.artsplit.com/images/empty.svg" alt="No data" className="w-60 h-60" />
                  <span>No withdrawal transactions found</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Report Generation Modal */}
      <Dialog open={reportModalOpen} onClose={setReportModalOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1f2225] rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-2xl font-bold text-white">Generate Withdrawals Report</DialogTitle>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                  />
                </div>
              </div>

              {/* Status and Method Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={reportFilters.status}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Method</label>
                  <select
                    value={reportFilters.method}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                  >
                    <option value="all">All Methods</option>
                    {uniqueMethods.map(method => (
                      <option key={method} value={method}>
                        {method === 'bank' ? 'Bank Transfer' : 
                         method === 'crypto' ? 'Crypto' : method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={reportFilters.minAmount}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={reportFilters.maxAmount}
                    onChange={(e) => setReportFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    placeholder="10000.00"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                  />
                </div>
              </div>

              {/* Report Summary Preview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Report Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{withdrawals.length}</div>
                    <div className="text-gray-400">Total Withdrawals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      ${withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0).toFixed(2)}
                    </div>
                    <div className="text-gray-400">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {withdrawals.filter(w => w.status === 'completed').length}
                    </div>
                    <div className="text-gray-400">Completed</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleGenerateReport('csv')}
                    disabled={generatingReport}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <FileText size={18} />
                    <span>{generatingReport ? 'Generating...' : 'Export CSV'}</span>
                  </button>
                  <button
                    onClick={() => handleGenerateReport('pdf')}
                    disabled={generatingReport}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <FileText size={18} />
                    <span>{generatingReport ? 'Generating...' : 'Export PDF'}</span>
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={resetReportFilters}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

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
                <DialogTitle className="text-lg font-semibold text-white">Mark Withdrawal as Failed</DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    Are you sure you want to mark withdrawal {withdrawalToDelete?.reference} as failed? 
                    This will refund the user's wallet and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
              <button
                onClick={confirmDelete}
                className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 sm:w-auto"
              >
                Mark as Failed
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
      {modalOpen && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1f2225] rounded-3xl shadow-2xl p-6 w-full max-w-2xl transform transition-transform duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Withdrawal Details - {selectedWithdrawal.reference}</h2>
              <button className="text-gray-400 hover:text-white transition" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Withdrawal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Transaction Information</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(selectedWithdrawal.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Reference:</span>
                    <span className="font-mono">{selectedWithdrawal.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Method:</span>
                    <span>{getWithdrawalMethod(selectedWithdrawal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-semibold">{formatAmount(selectedWithdrawal.amount)}</span>
                  </div>
                  {selectedWithdrawal.user && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">User:</span>
                        <span>{selectedWithdrawal.user.name || 'Unknown User'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{selectedWithdrawal.user.email || 'No email'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Withdrawal Details */}
                {selectedWithdrawal.withdrawal_details && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-white border-b border-gray-700 pb-2">Withdrawal Details</h4>
                    <div className="space-y-2 text-gray-300 mt-2">
                      {selectedWithdrawal.method === 'bank' && (
                        <>
                          <div className="flex justify-between">
                            <span>Bank Name:</span>
                            <span>{selectedWithdrawal.withdrawal_details.bank_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account Number:</span>
                            <span>{selectedWithdrawal.withdrawal_details.account_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account Name:</span>
                            <span>{selectedWithdrawal.withdrawal_details.account_name}</span>
                          </div>
                        </>
                      )}
                      {selectedWithdrawal.method === 'crypto' && (
                        <>
                          <div className="flex justify-between">
                            <span>Network:</span>
                            <span>{selectedWithdrawal.withdrawal_details.network}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wallet Address:</span>
                            <span className="font-mono text-sm">{selectedWithdrawal.withdrawal_details.wallet_address}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
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
                      placeholder="Add notes about this withdrawal..."
                      rows={4}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

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