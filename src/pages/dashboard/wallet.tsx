import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Eye, 
  EyeOff, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCcw,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import CryptoPaymentModal from "@/components/CryptoPaymentModal";
import WithdrawModal from "@/components/WithdrawModal";
import { getWallet } from "@/api/wallet";
import { 
  createTransaction, 
  fetchUserTransactions,
  getWalletAddress 
} from "../../slices/transactionSlice";
import { RootState, AppDispatch } from "../../store";

interface WalletData {
  id: number;
  currency: string;
  available_balance: string;
  invested_balance: string;
  total_balance: string;
  formatted: {
    available: string;
    invested: string;
    total: string;
  };
  recent_transactions: any[];
  created_at: string;
  updated_at: string;
}

interface WalletApiResponse {
  wallet: WalletData;
}

interface Transaction {
  id: number;
  reference: string;
  kind: string;
  type: string;
  amount: string;
  status: string;
  method: string;
  network?: string;
  proof_url?: string;
  withdrawal_details?: any;
  created_at: string;
  updated_at: string;
}

export default function WalletUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { userTransactions, loading: transactionsLoading, walletAddress } = useSelector(
    (state: RootState) => state.transactions
  );
  
  const [showBalance, setShowBalance] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Table filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterKind, setFilterKind] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const data: WalletApiResponse = await getWallet();
        setWallet(data.wallet);
        
        // Fetch transaction history
        await dispatch(fetchUserTransactions());
      } catch (err) {
        console.error("Failed to fetch wallet data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [dispatch]);

  const handleDeposit = async (amount: number, network: string, proof: string) => {
    try {
      await dispatch(createTransaction({
        kind: 'deposit',
        amount,
        network,
        proof_url: proof,
      })).unwrap();
      
      // Refresh wallet data and transactions
      const data: WalletApiResponse = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Deposit failed:', error);
      alert(error || 'Deposit failed. Please try again.');
    }
  };

  const handleWithdraw = async (amount: number, method: 'crypto' | 'bank', details: any) => {
    try {
      const transactionData: any = {
        kind: 'withdraw',
        amount,
        method,
        withdrawal_details: details,
      };

      if (method === 'crypto') {
        transactionData.network = details.network;
      }

      await dispatch(createTransaction(transactionData)).unwrap();
      
      // Refresh wallet data and transactions
      const data: WalletApiResponse = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
      
      setWithdrawOpen(false);
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      alert(error || 'Withdrawal failed. Please try again.');
    }
  };

  const handleGetWalletAddress = async (network: string) => {
    try {
      await dispatch(getWalletAddress(network)).unwrap();
    } catch (error: any) {
      console.error('Failed to get wallet address:', error);
      alert(error || 'Failed to get wallet address. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data: WalletApiResponse = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search transactions - use userTransactions from Redux
  const filteredTransactions = React.useMemo(() => {
    if (!userTransactions) return [];
    
    return userTransactions.filter((tx: Transaction) => {
      const matchesStatus = filterStatus === "all" || tx.status === filterStatus;
      const matchesKind = filterKind === "all" || tx.kind === filterKind;
      const matchesSearch = 
        tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.method && tx.method.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesStatus && matchesKind && matchesSearch;
    });
  }, [userTransactions, filterStatus, filterKind, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading && !wallet) {
    return (
      <div className="p-6 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6 text-white">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-500">Failed to load wallet. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const available = parseFloat(wallet.available_balance);
  const invested = parseFloat(wallet.invested_balance);
  const totalBalance = parseFloat(wallet.total_balance);
  const currency = wallet.currency || "USD";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Wallet Section */}
      <div className="bg-[#222629] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between mb-6">
        <div className="flex flex-col space-y-6">
          <div>
            <select className="border rounded-lg px-3 py-1 text-gray-600 bg-white">
              <option>{currency}</option>
            </select>
          </div>

          {/* Balance + toggle */}
          <div className="flex items-center space-x-3">
            <div className="text-4xl font-bold text-white">
              {showBalance ? `${currency} ${totalBalance.toFixed(2)}` : "••••••"}
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-blue-400 text-sm">Total Balance</div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-colors"
            >
              <ArrowDownCircle size={20} />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              disabled={available <= 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-colors ${
                available <= 0 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-900'
              }`}
            >
              <ArrowUpCircle size={20} />
              <span>Withdraw</span>
            </button>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-blue-900 px-6 py-3 rounded-2xl transition-colors disabled:opacity-50"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Balances */}
        <div className="flex flex-col space-y-4 mt-6 md:mt-0 md:w-1/3">
          <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
            <div className="w-full">
              <p className="text-gray-600 text-sm mb-1">Invested</p>
              <p className="text-2xl font-semibold text-gray-800">
                {showBalance ? `${currency} ${invested.toFixed(2)}` : "••••••"}
              </p>
              <span className="text-xs text-gray-500">
                {showBalance ? wallet.formatted.invested : "Hidden"}
              </span>
            </div>
          </div>

          <div className="border border-green-200 rounded-xl p-4 bg-green-50">
            <div className="w-full">
              <p className="text-gray-600 text-sm mb-1">Available</p>
              <p className="text-2xl font-semibold text-gray-800">
                {showBalance ? `${currency} ${available.toFixed(2)}` : "••••••"}
              </p>
              <span className="text-xs text-gray-500">
                {showBalance ? wallet.formatted.available : "Hidden"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {userTransactions && userTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Total Transactions</div>
            <div className="text-white text-xl font-bold">{userTransactions.length}</div>
          </div>
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Pending</div>
            <div className="text-yellow-400 text-xl font-bold">
              {userTransactions.filter((t: Transaction) => t.status === 'pending').length}
            </div>
          </div>
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Completed</div>
            <div className="text-green-400 text-xl font-bold">
              {userTransactions.filter((t: Transaction) => t.status === 'completed').length}
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="bg-[#222629] rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
            
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by reference or method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#2a2e32] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-full md:w-64"
                />
              </div>

              {/* Filters */}
              <select
                value={filterKind}
                onChange={(e) => setFilterKind(e.target.value)}
                className="px-4 py-2 bg-[#2a2e32] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdraw">Withdrawals</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-[#2a2e32] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {transactionsLoading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-lg mb-2">No transactions found</p>
              <p className="text-sm">Try adjusting your filters or make your first transaction</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#2a2e32] border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Method/Network
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedTransactions.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-[#2a2e32] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{tx.reference}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {tx.kind === 'deposit' ? (
                          <ArrowDownCircle className="mr-2 text-green-400" size={16} />
                        ) : (
                          <ArrowUpCircle className="mr-2 text-orange-400" size={16} />
                        )}
                        <span className="text-sm text-white capitalize">{tx.kind}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300 capitalize">
                        {tx.network ? `${tx.network}` : (tx.method || 'N/A')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        tx.kind === 'deposit' ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {tx.kind === 'deposit' ? '+' : '-'}{currency} {parseFloat(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-[#2a2e32] text-white rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-1 text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-[#2a2e32] text-white rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <CryptoPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeposit={handleDeposit}
        onGetWalletAddress={handleGetWalletAddress}
        walletAddress={walletAddress}
      />
      
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
        availableBalance={available}
      />
    </div>
  );
}