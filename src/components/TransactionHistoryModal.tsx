import React from "react";
import { X, Download, Filter, Search } from "lucide-react";
import { Transaction } from "../types/transaction";

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  loading: boolean;
}

export default function TransactionHistoryModal({ 
  isOpen, 
  onClose, 
  transactions, 
  loading 
}: TransactionHistoryModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getKindIcon = (kind: string) => {
    return kind === 'deposit' ? '↘️' : '↗️';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-gray-500 text-sm mt-1">
              {transactions.length} transactions found
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg">
              <Download size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg">
              <Filter size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💸</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      transaction.kind === 'deposit' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {getKindIcon(transaction.kind)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 capitalize">
                          {transaction.kind}
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
                    <p className={`text-lg font-bold ${
                      transaction.kind === 'deposit' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {transaction.kind === 'deposit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}