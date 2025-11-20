import React, { useState, useMemo } from "react";
import { X, Download, Filter, Search } from "lucide-react";
import { Transaction } from "../types/transaction";

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  loading: boolean;
}

interface FilterState {
  kind: string;
  status: string;
  method: string;
  dateRange: string;
}

export default function TransactionHistoryModal({ 
  isOpen, 
  onClose, 
  transactions, 
  loading 
}: TransactionHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    kind: "all",
    status: "all",
    method: "all",
    dateRange: "all"
  });

  // Debug: Log transaction kinds to see what we're receiving
  React.useEffect(() => {
    if (transactions.length > 0) {
      const kinds = [...new Set(transactions.map(t => t.kind))];
      console.log('Available transaction kinds:', kinds);
      console.log('Sample transactions:', transactions.slice(0, 3));
    }
  }, [transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10 border border-green-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20';
      case 'failed': return 'text-red-500 bg-red-500/10 border border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border border-gray-500/20';
    }
  };

  const getKindIcon = (kind: string) => {
    const normalizedKind = kind.toLowerCase();
    switch (normalizedKind) {
      case 'deposit': return '↘️';
      case 'withdraw':
      case 'withdrawal': return '↗️';
      case 'royalty_earning':
      case 'royalty': 
      case 'royalty earning': return '💰';
      case 'roi_distribution':
      case 'roi':
      case 'roi distribution': return '📈';
      case 'earning': return '💵';
      case 'distribution': return '📊';
      default: return '💸';
    }
  };

  // Enhanced function to determine if amount should be positive or negative
  const getAmountDisplay = (transaction: Transaction) => {
    const amount = parseFloat(transaction.amount).toFixed(2);
    const normalizedKind = transaction.kind.toLowerCase();
    
    console.log(`Processing transaction:`, {
      kind: transaction.kind,
      normalizedKind,
      amount: transaction.amount
    });

    // List of all transaction types that should be POSITIVE (incoming money)
    const positiveTransactionTypes = [
      'deposit',
      'royalty_earning',
      'royalty',
      'royalty earning',
      'roi_distribution', 
      'roi',
      'roi distribution',
      'earning',
      'distribution',
      'dividend',
      'yield',
      'interest',
      'bonus'
    ];

    // List of all transaction types that should be NEGATIVE (outgoing money)
    const negativeTransactionTypes = [
      'withdraw',
      'withdrawal',
      'purchase',
      'investment',
      'fee',
      'charge'
    ];

    // Check if this is a positive transaction type
    const isPositive = positiveTransactionTypes.some(type => 
      normalizedKind.includes(type.toLowerCase())
    );

    // Check if this is a negative transaction type  
    const isNegative = negativeTransactionTypes.some(type =>
      normalizedKind.includes(type.toLowerCase())
    );

    // Default to positive if we can't determine
    const shouldBePositive = isPositive || !isNegative;

    const displayAmount = shouldBePositive ? `+$${amount}` : `-$${amount}`;
    
    console.log(`Amount display: ${displayAmount} (positive: ${shouldBePositive})`);
    
    return displayAmount;
  };

  // Get color class based on transaction kind
  const getAmountColor = (transaction: Transaction) => {
    const normalizedKind = transaction.kind.toLowerCase();
    
    // Positive transaction types - green
    const positiveTypes = [
      'deposit',
      'royalty_earning',
      'royalty',
      'roi_distribution',
      'roi',
      'earning',
      'distribution',
      'dividend',
      'yield',
      'interest',
      'bonus'
    ];

    // Negative transaction types - orange/red
    const negativeTypes = [
      'withdraw',
      'withdrawal',
      'purchase',
      'investment',
      'fee',
      'charge'
    ];

    const isPositive = positiveTypes.some(type => 
      normalizedKind.includes(type.toLowerCase())
    );
    const isNegative = negativeTypes.some(type =>
      normalizedKind.includes(type.toLowerCase())
    );

    // Default to green if we can't determine
    return isNegative ? 'text-orange-600' : 'text-green-600';
  };

  // Get background color for icon
  const getIconBackground = (kind: string) => {
    const normalizedKind = kind.toLowerCase();
    
    if (normalizedKind.includes('royalty') || normalizedKind.includes('earning')) {
      return 'bg-purple-100';
    }
    if (normalizedKind.includes('roi') || normalizedKind.includes('distribution') || normalizedKind.includes('dividend')) {
      return 'bg-blue-100';
    }
    if (normalizedKind.includes('deposit')) {
      return 'bg-green-100';
    }
    if (normalizedKind.includes('withdraw')) {
      return 'bg-orange-100';
    }
    return 'bg-gray-100';
  };

  // Format transaction kind for display
  const formatTransactionKind = (kind: string) => {
    const normalizedKind = kind.toLowerCase();
    
    if (normalizedKind.includes('royalty') && normalizedKind.includes('earning')) {
      return 'Royalty Earnings';
    }
    if (normalizedKind.includes('roi') && normalizedKind.includes('distribution')) {
      return 'ROI Distribution';
    }
    
    // Replace underscores with spaces and capitalize each word
    return kind
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateMobile = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique methods for filter dropdown
  const uniqueMethods = useMemo(() => {
    const methods = transactions.map(t => t.method).filter(Boolean);
    return [...new Set(methods)] as string[];
  }, [transactions]);

  // Get unique kinds for filter dropdown
  const uniqueKinds = useMemo(() => {
    const kinds = transactions.map(t => t.kind).filter(Boolean);
    return [...new Set(kinds)] as string[];
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.network?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.kind.toLowerCase().includes(searchQuery.toLowerCase());

      // Kind filter
      const matchesKind = filters.kind === "all" || transaction.kind === filters.kind;
      
      // Status filter
      const matchesStatus = filters.status === "all" || transaction.status === filters.status;
      
      // Method filter
      const matchesMethod = filters.method === "all" || transaction.method === filters.method;
      
      // Date range filter (basic implementation)
      const matchesDateRange = filters.dateRange === "all" || true;

      return matchesSearch && matchesKind && matchesStatus && matchesMethod && matchesDateRange;
    });
  }, [transactions, searchQuery, filters]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      kind: "all",
      status: "all",
      method: "all",
      dateRange: "all"
    });
    setSearchQuery("");
  };

  // Simple PDF generation using browser print
  const downloadPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Transaction History</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .positive { color: green; font-weight: bold; }
            .negative { color: orange; font-weight: bold; }
            .completed { background-color: #d4edda; }
            .pending { background-color: #fff3cd; }
            .failed { background-color: #f8d7da; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Transaction History</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Total Transactions: ${filteredTransactions.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Network</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(transaction => {
                const amountDisplay = getAmountDisplay(transaction);
                const isPositive = amountDisplay.startsWith('+');
                const amountClass = isPositive ? 'positive' : 'negative';
                
                return `
                <tr class="${transaction.status}">
                  <td>${transaction.reference}</td>
                  <td>${formatTransactionKind(transaction.kind)}</td>
                  <td>${transaction.method || 'N/A'}</td>
                  <td class="${amountClass}">
                    ${amountDisplay}
                  </td>
                  <td>${transaction.status.toUpperCase()}</td>
                  <td>${formatDate(transaction.created_at)}</td>
                  <td>${transaction.network || 'N/A'}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
          
          <div class="no-print" style="margin-top: 20px; padding: 10px; background: #f0f0f0;">
            <p>Click the browser's print button and choose "Save as PDF" to download.</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print/Save as PDF
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // Download as CSV
  const downloadCSV = () => {
    const headers = ['Reference', 'Type', 'Method', 'Amount', 'Status', 'Date', 'Network', 'Notes'];
    const csvData = filteredTransactions.map(transaction => {
      const amountDisplay = getAmountDisplay(transaction);
      return [
        `"${transaction.reference}"`,
        `"${formatTransactionKind(transaction.kind)}"`,
        `"${transaction.method || ''}"`,
        amountDisplay,
        `"${transaction.status}"`,
        `"${formatDate(transaction.created_at)}"`,
        `"${transaction.network || ''}"`,
        `"${transaction.admin_notes || ''}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transaction-history-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    if (window.innerWidth < 768) {
      downloadCSV();
    } else {
      if (window.confirm('Download as CSV (Recommended) or open PDF version?')) {
        downloadCSV();
      } else {
        downloadPDF();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-4xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white sticky top-0 z-20">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Transaction History</h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button 
              className="hidden sm:flex p-2 text-gray-500 hover:text-gray-700 border rounded-lg items-center gap-1"
              onClick={handleDownload}
              title="Download transactions"
            >
              <Download size={18} />
            </button>

            <button 
              className={`p-2 border rounded-lg ${
                showFilters ? 'text-blue-600 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 border-gray-300'
              }`}
              onClick={() => setShowFilters(!showFilters)}
              title="Filter transactions"
            >
              <Filter size={18} />
            </button>
            
            <button 
              onClick={onClose} 
              className="p-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <X size={20} className="sm:size-[24px]" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b bg-gray-50 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Kind Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.kind}
                  onChange={(e) => setFilters(prev => ({ ...prev, kind: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  {uniqueKinds.map(kind => (
                    <option key={kind} value={kind}>{formatTransactionKind(kind)}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={filters.method}
                  onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Methods</option>
                  {uniqueMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Reset all filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by reference, method, network, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💸</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {transactions.length === 0 ? "Your transaction history will appear here." : "Try adjusting your search or filters."}
                </p>
                {(searchQuery || filters.kind !== "all" || filters.status !== "all" || filters.method !== "all") && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredTransactions.map((transaction) => {
                  const amountDisplay = getAmountDisplay(transaction);
                  const amountColor = getAmountColor(transaction);
                  const iconBackground = getIconBackground(transaction.kind);
                  const formattedKind = formatTransactionKind(transaction.kind);
                  
                  return (
                    <div
                      key={transaction.id}
                      className="border rounded-xl hover:bg-gray-50 transition-colors overflow-hidden"
                    >
                      {/* Mobile Layout */}
                      <div className="sm:hidden p-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${iconBackground}`}>
                              {getKindIcon(transaction.kind)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                  {formattedKind}
                                </p>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)} flex-shrink-0`}>
                                  {transaction.status}
                                </span>
                              </div>
                              <p className="text-gray-500 text-xs">
                                {formatDateMobile(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className={`text-base font-bold ${amountColor}`}>
                              {amountDisplay}
                            </p>
                            <p className="text-gray-500 text-xs capitalize">
                              {transaction.method}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Reference:</span>
                            <span className="text-gray-700 font-mono truncate ml-2">{transaction.reference}</span>
                          </div>
                          {transaction.network && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Network:</span>
                              <span className="text-gray-700 capitalize">{transaction.network}</span>
                            </div>
                          )}
                          {transaction.admin_notes && (
                            <div className="text-xs">
                              <span className="text-gray-500">Note: </span>
                              <span className="text-gray-700 line-clamp-2">{transaction.admin_notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${iconBackground}`}>
                            {getKindIcon(transaction.kind)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {formattedKind}
                              </p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm">
                              {formatDate(transaction.created_at)}
                            </p>
                            <p className="text-gray-400 text-xs font-mono">
                              Ref: {transaction.reference}
                            </p>
                            {transaction.network && (
                              <p className="text-gray-500 text-xs capitalize">
                                Network: {transaction.network}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-lg font-bold ${amountColor}`}>
                            {amountDisplay}
                          </p>
                          <p className="text-gray-500 text-sm capitalize">
                            {transaction.method}
                          </p>
                          {transaction.admin_notes && (
                            <p className="text-gray-400 text-xs mt-1 max-w-xs">
                              Note: {transaction.admin_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="sm:hidden border-t bg-white p-4 sticky bottom-0">
          <div className="flex space-x-3">
            <button 
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium text-sm"
            >
              <Download size={16} />
              Download
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border rounded-xl font-medium text-sm ${
                showFilters 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}