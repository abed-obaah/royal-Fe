// AlbumGrid.jsx
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import WalletUi from "./wallet";

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
  ChevronRight,
  Crown,
  Gift,
  Users
} from "lucide-react";
import CryptoPaymentModal from "@/components/CryptoPaymentModal";
import WithdrawModal from "@/components/WithdrawModal";
import { getWallet } from "@/api/wallet";
import { 
  createTransaction, 
  fetchUserTransactions,
  getWalletAddress,
  updateTransactionAdmin 
} from "../../slices/transactionSlice";
import { RootState, AppDispatch } from "../../store";

const albums = [
  {
    id: 1,
    title: "The Death of Slim Shady",
    artist: "Eminem",
    cover: "https://picsum.photos/200?1",
    price: 12.99,
    riskRating: "Medium",
    roiRange: "15-25%",
    assetType: "Single",
    entryPoint: "$10.50",
    roiToDate: "+18.3%",
    genre: "Hip-Hop",
    popularity: 85,
  },
  {
    id: 2,
    title: "The Marshall Mathers LP",
    artist: "Eminem",
    cover: "https://picsum.photos/200?2",
    price: 14.99,
    riskRating: "Low",
    roiRange: "8-12%",
    assetType: "Single",
    entryPoint: "$13.25",
    roiToDate: "+10.5%",
    genre: "Hip-Hop",
    popularity: 92,
  },
];

const filters = {
  genre: [
    { value: "Hip-Hop", label: "Hip-Hop", checked: false },
    { value: "Greatest Hits", label: "Greatest Hits", checked: false },
  ],
  riskRating: [
    { value: "Very High", label: "Very High", checked: false },
    { value: "High", label: "High", checked: false },
    { value: "Medium", label: "Medium", checked: false },
    { value: "Low", label: "Low", checked: false },
  ],
};

const sortOptions = [
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
  { name: "ROI: Low to High", value: "roi-asc" },
  { name: "ROI: High to Low", value: "roi-desc" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AlbumGrid({ onAlbumClick }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState("roi-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [albumsData, setAlbumsData] = useState(albums);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEditClick = (album) => {
    setEditingAlbum(album.id);
    setEditForm({ ...album });
  };

  const handleSaveEdit = () => {
    setAlbumsData((prev) =>
      prev.map((album) =>
        album.id === editingAlbum ? { ...editForm } : album
      )
    );
    setEditingAlbum(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingAlbum(null);
    setEditForm({});
  };

  const handleDeleteClick = (albumId) => {
    if (window.confirm("Are you sure you want to delete this album?")) {
      setAlbumsData((prev) => prev.filter((album) => album.id !== albumId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "Very High":
        return "text-red-500";
      case "High":
        return "text-orange-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  const getROIColor = (roi) =>
    roi.includes("+") ? "text-green-400" : "text-red-400";

  const getFilteredAlbums = () => {
    let filtered = [...albumsData];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (album) =>
          album.title.toLowerCase().includes(query) ||
          album.artist.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "roi-asc":
        filtered.sort(
          (a, b) => parseFloat(a.roiToDate) - parseFloat(b.roiToDate)
        );
        break;
      case "roi-desc":
        filtered.sort(
          (a, b) => parseFloat(b.roiToDate) - parseFloat(a.roiToDate)
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredAlbums = getFilteredAlbums();

  const dispatch = useDispatch();
  const { userTransactions, loading: transactionsLoading, walletAddress } = useSelector(
    (state) => state.transactions
  );
  
  const [showBalance, setShowBalance] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Table filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKind, setFilterKind] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Transaction editing states
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editTransactionForm, setEditTransactionForm] = useState({});
  const [isAdmin, setIsAdmin] = useState(true); // Replace with actual admin check from your auth system

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const data = await getWallet();
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

  const handleDeposit = async (amount, network, proof) => {
    try {
      await dispatch(createTransaction({
        kind: 'deposit',
        amount,
        network,
        proof_url: proof,
      })).unwrap();
      
      // Refresh wallet data and transactions
      const data = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Deposit failed:', error);
      alert(error || 'Deposit failed. Please try again.');
    }
  };

  const handleWithdraw = async (amount, method, details) => {
    try {
      const transactionData = {
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
      const data = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
      
      setWithdrawOpen(false);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert(error || 'Withdrawal failed. Please try again.');
    }
  };

  const handleGetWalletAddress = async (network) => {
    try {
      await dispatch(getWalletAddress(network)).unwrap();
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      alert(error || 'Failed to get wallet address. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transaction editing handlers
  const handleEditTransactionClick = (transaction) => {
    setEditingTransaction(transaction.id);
    setEditTransactionForm({ 
      ...transaction,
      amount: parseFloat(transaction.amount).toFixed(2),
      // Ensure kind is properly set
      kind: transaction.kind || 'deposit',
      // Convert date to local datetime string for input
      created_at: new Date(transaction.created_at).toISOString().slice(0, 16)
    });
  };

  const handleSaveTransactionEdit = async () => {
    try {
      // Prepare the data for API - ensure proper formatting
      const submissionData = {
        ...editTransactionForm,
        amount: parseFloat(editTransactionForm.amount),
        // Ensure we're not sending undefined values
        network: editTransactionForm.network || null,
        method: editTransactionForm.method || null,
        proof_url: editTransactionForm.proof_url || null,
        withdrawal_details: editTransactionForm.withdrawal_details || null,
        admin_notes: editTransactionForm.admin_notes || null,
      };

      console.log('Sending transaction update:', submissionData);

      await dispatch(updateTransactionAdmin({
        id: editingTransaction,
        transactionData: submissionData
      })).unwrap();
      
      setEditingTransaction(null);
      setEditTransactionForm({});
      // Refresh transactions
      await dispatch(fetchUserTransactions());
      
      // Refresh wallet data to reflect balance changes
      const data = await getWallet();
      setWallet(data.wallet);
      
    } catch (error) {
      console.error('Failed to update transaction:', error);
      alert(error || 'Failed to update transaction');
    }
  };

  const handleCancelTransactionEdit = () => {
    setEditingTransaction(null);
    setEditTransactionForm({});
  };

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setEditTransactionForm((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleTransactionSelectChange = (e) => {
    const { name, value } = e.target;
    setEditTransactionForm((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  // Get transaction type icon
  const getTransactionIcon = (kind) => {
    switch (kind) {
      case 'deposit':
        return <ArrowDownCircle className="mr-2 text-green-400" size={16} />;
      case 'withdraw':
        return <ArrowUpCircle className="mr-2 text-orange-400" size={16} />;
      case 'royalty':
        return <Crown className="mr-2 text-purple-400" size={16} />;
      case 'referral':
        return <Users className="mr-2 text-blue-400" size={16} />;
      case 'bonus':
        return <Gift className="mr-2 text-yellow-400" size={16} />;
      default:
        return <ArrowDownCircle className="mr-2 text-gray-400" size={16} />;
    }
  };

  // Get amount color based on transaction type
  const getAmountColor = (kind) => {
    return kind === 'deposit' || kind === 'royalty' || kind === 'referral' || kind === 'bonus' 
      ? 'text-green-400' 
      : 'text-orange-400';
  };

  // Get amount sign based on transaction type
  const getAmountSign = (kind) => {
    return kind === 'deposit' || kind === 'royalty' || kind === 'referral' || kind === 'bonus' ? '+' : '-';
  };

  // Filter and search transactions - use userTransactions from Redux
  const filteredTransactions = React.useMemo(() => {
    if (!userTransactions) return [];
    
    return userTransactions.filter((tx) => {
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[status] || styles.pending;
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
    <div className="min-h-screen">
      <WalletUi />

      {/* Search + Sort */}
      <div className="flex justify-between items-center mb-4 px-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
        />
      </div>

      <div className="px-4 md:p-6">
        <div className="bg-[#222629] rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              
              <div className="flex flex-col md:flex-row gap-3">
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
  
                <select
                  value={filterKind}
                  onChange={(e) => setFilterKind(e.target.value)}
                  className="px-4 py-2 bg-[#2a2e32] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdraw">Withdrawals</option>
                  <option value="royalty">Royalties</option>
                  <option value="referral">Referrals</option>
                  <option value="bonus">Bonuses</option>
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
                    {isAdmin && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#2a2e32] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTransaction === tx.id ? (
                          <input
                            type="text"
                            name="reference"
                            value={editTransactionForm.reference || ''}
                            onChange={handleTransactionInputChange}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                          />
                        ) : (
                          <div className="text-sm font-medium text-white">{tx.reference}</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTransaction === tx.id ? (
                          <select
                            name="kind"
                            value={editTransactionForm.kind || 'deposit'}
                            onChange={handleTransactionSelectChange}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                          >
                            <option value="deposit">Deposit</option>
                            <option value="withdraw">Withdraw</option>
                            <option value="royalty">Royalty</option>
                            <option value="referral">Referral</option>
                            <option value="bonus">Bonus</option>
                          </select>
                        ) : (
                          <div className="flex items-center">
                            {getTransactionIcon(tx.kind)}
                            <span className="text-sm text-white capitalize">{tx.kind}</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTransaction === tx.id ? (
                          <input
                            type="text"
                            name="network"
                            value={editTransactionForm.network || editTransactionForm.method || ''}
                            onChange={handleTransactionInputChange}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                            placeholder="Network/Method"
                          />
                        ) : (
                          <span className="text-sm text-gray-300 capitalize">
                            {tx.network ? `${tx.network}` : (tx.method || 'N/A')}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTransaction === tx.id ? (
                          <input
                            type="number"
                            step="0.01"
                            name="amount"
                            value={editTransactionForm.amount || ''}
                            onChange={handleTransactionInputChange}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                          />
                        ) : (
                          <span className={`text-sm font-semibold ${getAmountColor(tx.kind)}`}>
                            {getAmountSign(tx.kind)}{currency} {parseFloat(tx.amount).toFixed(2)}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTransaction === tx.id ? (
                          <select
                            name="status"
                            value={editTransactionForm.status || 'pending'}
                            onChange={handleTransactionSelectChange}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(tx.status)}`}>
                            {tx.status}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {editingTransaction === tx.id ? (
                          <input
                            type="datetime-local"
                            name="created_at"
                            value={editTransactionForm.created_at || ''}
                            onChange={handleTransactionInputChange}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                          />
                        ) : (
                          new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        )}
                      </td>
                      
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingTransaction === tx.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveTransactionEdit}
                                className="text-green-400 hover:text-green-300"
                                title="Save changes"
                              >
                                <CheckIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelTransactionEdit}
                                className="text-red-400 hover:text-red-300"
                                title="Cancel editing"
                              >
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditTransactionClick(tx)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Edit transaction"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      )}
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
      </div>
    </div>
  );
}