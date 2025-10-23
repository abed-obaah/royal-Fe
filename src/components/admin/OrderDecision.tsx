import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchPendingSellOrders,
  approveSellOrder,
  fetchOrderHistory,
  clearError
} from "../../slices/orderSlice";
import { distributeRoyalties } from "../../api/royalty";

interface OrderDecisionProps {
  // You can add props here if needed
}

interface Order {
  id: number;
  user_id: number;
  portfolio_id: number;
  asset_id: number;
  asset_type: string;
  order_type: 'buy' | 'sell';
  price: string;
  quantity: number;
  total: string;
  status: 'pending' | 'completed' | 'rejected';
  reference: string;
  meta: any;
  created_at: string;
  updated_at: string;
  asset?: {
    id: number;
    title: string;
    artist: string;
    price: string;
    type: string;
    image_base64: string;
    available_shares: number;
    expected_roi_percent: string;
    current_roi_percent: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Royalty Distribution Types
interface Asset {
  id: number;
  title: string;
  artist: string;
  type: 'single' | 'basket';
  total_shares: number;
  available_shares: number;
  price: string;
  image_base64?: string;
  image_url?: string;
  invested_shares?: number;
  current_value?: string;
}

interface UserInvestment {
  user_id: number;
  user_name: string;
  user_email: string;
  assets: Asset[];
  total_investment: number;
}

interface RoyaltyDistributionData {
  asset_id: number;
  total_amount: number;
  period: string;
  royalty_rate: number;
  type: 'streaming' | 'sales' | 'performance' | 'mechanical';
  description: string;
  auto_process: boolean;
}

const OrderDecision: React.FC<OrderDecisionProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingSellOrders, orderHistory, loading, error } = useSelector(
    (state: RootState) => state.order
  );

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "rejected">("all");
  
  // Royalty Distribution State
  const [showRoyaltyModal, setShowRoyaltyModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [distributionData, setDistributionData] = useState<RoyaltyDistributionData>({
    asset_id: 0,
    total_amount: 0,
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    royalty_rate: 2.5,
    type: 'streaming',
    description: '',
    auto_process: true
  });
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [distributionResult, setDistributionResult] = useState<any>(null);

  // User Investments State
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'investments'>('orders');

  useEffect(() => {
    dispatch(fetchPendingSellOrders());
    fetchAssets();
    fetchUserInvestments();
  }, [dispatch]);

  const fetchAssets = async () => {
  try {
    const response = await fetch('/api/assets', {
      headers: {
        'Authorization': `Bearer ${yourAuthToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch assets');
    }

    // Handle both response formats
    if (data.success && data.data) {
      return data.data; // New format
    } else if (Array.isArray(data)) {
      return data; // Old format (array)
    } else {
      return data; // Fallback
    }

  } catch (error) {
    console.error('fetchAssets error:', error);
    throw error;
  }
};

const fetchUserInvestments = async (userId: string) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/investments`, {
      headers: {
        'Authorization': `Bearer ${yourAuthToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', text.substring(0, 200));
      throw new Error('Users API returned non-JSON response');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user investments');
    }

    // Handle both response formats
    if (data.success && data.data) {
      return data.data; // New format
    } else {
      return data; // Old format
    }

  } catch (error) {
    console.error('fetchUserInvestments error:', error);
    throw error;
  }
};

  const handleApproveReject = async (orderId: number, action: 'approve' | 'reject') => {
    setActionLoading(orderId);
    try {
      const result = await dispatch(approveSellOrder({ order_id: orderId, action })).unwrap();
      
      setShowSuccessMessage(`Order ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
      await dispatch(fetchPendingSellOrders());
      
      setTimeout(() => {
        setShowSuccessMessage("");
      }, 5000);
      
    } catch (error: any) {
      console.error(`Failed to ${action} order:`, error);
      setShowSuccessMessage(`Failed to ${action} order: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDistributeRoyalties = async () => {
    if (!distributionData.asset_id || distributionData.total_amount <= 0) {
      setShowSuccessMessage("Please select an asset and enter a valid amount");
      return;
    }

    setDistributionLoading(true);
    try {
      const result = await distributeRoyalties(distributionData.asset_id, distributionData);
      
      setDistributionResult(result);
      setShowSuccessMessage(`Royalties distributed successfully! Total: $${result.total_distributed}`);
      
      // Reset form
      setDistributionData({
        asset_id: 0,
        total_amount: 0,
        period: new Date().toISOString().slice(0, 7),
        royalty_rate: 2.5,
        type: 'streaming',
        description: '',
        auto_process: true
      });
      setSelectedAsset(null);
      
      setTimeout(() => {
        setShowRoyaltyModal(false);
        setDistributionResult(null);
      }, 3000);
    } catch (error: any) {
      setShowSuccessMessage(`Distribution failed: ${error.message}`);
    } finally {
      setDistributionLoading(false);
    }
  };

  const handleDistributeToUserAsset = async (userId: number, assetId: number) => {
    setDistributionLoading(true);
    try {
      // For user-specific distribution, you might want to modify the API to handle single user
      const result = await distributeRoyalties(assetId, {
        ...distributionData,
        asset_id: assetId,
        // You could add user_id filter here if your API supports it
      });
      
      setShowSuccessMessage(`Royalties distributed for user! Total: $${result.total_distributed}`);
      setShowInvestmentsModal(false);
    } catch (error: any) {
      setShowSuccessMessage(`Distribution failed: ${error.message}`);
    } finally {
      setDistributionLoading(false);
    }
  };

  // Helper function to get image source from base64 or URL
  const getImageSrc = (asset: any) => {
    if (asset?.image_base64) {
      if (asset.image_base64.startsWith('data:')) {
        return asset.image_base64;
      }
      return `data:image/jpeg;base64,${asset.image_base64}`;
    }
    if (asset?.image_url) {
      return asset.image_url;
    }
    return "https://via.placeholder.com/40";
  };

  // Safe access to order arrays
  const pendingOrders: Order[] = Array.isArray(pendingSellOrders) ? pendingSellOrders : [];

  // Filter orders based on search and status
  const filteredPendingOrders = pendingOrders.filter(order => 
    order.asset?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_id?.toString().includes(searchTerm) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter user investments based on search
  const filteredUserInvestments = userInvestments.filter(investment =>
    investment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investment.assets.some(asset => 
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.artist.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const displayOrders = filteredPendingOrders;
  const displayInvestments = filteredUserInvestments;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getOrderTypeColor = (orderType: string) => {
    switch (orderType.toLowerCase()) {
      case 'buy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sell':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActionButtonColor = (action: 'approve' | 'reject') => {
    return action === 'approve' 
      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 border-green-500/30 hover:border-green-500/50'
      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const totalPendingOrders = pendingOrders.length;
  const totalInvestors = userInvestments.length;
  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.total_investment, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage orders and royalty distributions</p>
          </div>
          
          {/* Admin Stats and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-xl px-4 py-3">
              <div className="text-yellow-400 text-sm font-medium">Pending Orders</div>
              <div className="text-white font-bold text-lg">{totalPendingOrders}</div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-xl px-4 py-3">
              <div className="text-blue-400 text-sm font-medium">Active Investors</div>
              <div className="text-white font-bold text-lg">{totalInvestors}</div>
            </div>
            
            {/* Royalty Distribution Button */}
            <button
              onClick={() => setShowRoyaltyModal(true)}
              className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 hover:from-purple-500/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl px-6 py-3 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-purple-400 group-hover:text-purple-300 font-semibold">
                  Distribute Royalties
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden mb-6">
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/20'
              }`}
            >
              Pending Orders ({totalPendingOrders})
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === 'investments'
                  ? 'bg-green-500/20 text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/20'
              }`}
            >
              User Investments ({totalInvestors})
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className={`p-4 rounded-xl mb-6 backdrop-blur-sm flex justify-between items-center ${
            showSuccessMessage.includes('Failed') 
              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
              : 'bg-green-500/20 border border-green-500/30 text-green-400'
          }`}>
            <div className="flex items-center gap-2">
              {showSuccessMessage.includes('Failed') ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span>{showSuccessMessage}</span>
            </div>
            <button
              onClick={() => setShowSuccessMessage("")}
              className={`hover:opacity-70 ${
                showSuccessMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 backdrop-blur-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-400 hover:text-red-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-2">
                  Search {activeTab === 'orders' ? 'Orders' : 'Investments'}
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder={
                    activeTab === 'orders' 
                      ? "Search by asset name, user name, order reference, or user ID..."
                      : "Search by user name, email, or asset name..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'orders' ? (
          /* Orders Table */
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-gray-400 text-sm font-semibold border-b border-gray-700/50">
              <div className="col-span-3">ASSET & USER</div>
              <div className="col-span-2 text-center">ORDER DETAILS</div>
              <div className="col-span-2 text-center">FINANCIAL INFO</div>
              <div className="col-span-2 text-center">DATE</div>
              <div className="col-span-3 text-right">ACTIONS</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-700/50">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">
                    No pending orders found
                  </div>
                  <div className="text-gray-400 text-sm">
                    {searchTerm ? "Try adjusting your search criteria" : "All sell orders have been processed"}
                  </div>
                </div>
              ) : (
                displayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-12 gap-4 items-center p-6 hover:bg-gray-700/20 transition-all duration-200"
                  >
                    {/* Asset & User Info */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getImageSrc(order.asset)}
                            alt={order.asset?.title || 'Asset'}
                            className="w-12 h-12 rounded-xl shadow-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                            <span className="text-xs text-white">!</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {order.asset?.title || `Asset ${order.asset_id}`}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {order.asset?.artist || "Unknown Artist"}
                          </p>
                          <p className="text-gray-400 text-sm truncate">
                            User: {order.user?.name || `User ${order.user_id}`}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Ref: {order.reference}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="col-span-2 text-center">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderTypeColor(order.order_type)}`}>
                          {order.order_type.toUpperCase()}
                        </span>
                        <span className="text-white font-semibold">
                          {order.quantity} shares
                        </span>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="col-span-2 text-center">
                      <div className="text-white font-semibold">${parseFloat(order.price || '0').toFixed(2)}</div>
                      <div className="text-green-400 text-sm font-medium">
                        ${parseFloat(order.total || '0').toFixed(2)}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-center">
                      <div className="text-gray-300 text-sm">{formatDate(order.created_at)}</div>
                    </div>

                    {/* Actions / Status */}
                    <div className="col-span-3 flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveReject(order.id, 'approve')}
                          disabled={actionLoading === order.id}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getActionButtonColor('approve')}`}
                        >
                          {actionLoading === order.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            "Approve"
                          )}
                        </button>
                        <button
                          onClick={() => handleApproveReject(order.id, 'reject')}
                          disabled={actionLoading === order.id}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getActionButtonColor('reject')}`}
                        >
                          {actionLoading === order.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            "Reject"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Investments Table */
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-gray-400 text-sm font-semibold border-b border-gray-700/50">
              <div className="col-span-4">USER</div>
              <div className="col-span-3 text-center">INVESTMENT SUMMARY</div>
              <div className="col-span-3 text-center">ASSETS</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-700/50">
              {investmentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : displayInvestments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">
                    No investments found
                  </div>
                  <div className="text-gray-400 text-sm">
                    {searchTerm ? "Try adjusting your search criteria" : "No users have made investments yet"}
                  </div>
                </div>
              ) : (
                displayInvestments.map((investment) => (
                  <div
                    key={investment.user_id}
                    className="grid grid-cols-12 gap-4 items-center p-6 hover:bg-gray-700/20 transition-all duration-200"
                  >
                    {/* User Info */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                          {investment.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {investment.user_name}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {investment.user_email}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            ID: {investment.user_id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Investment Summary */}
                    <div className="col-span-3 text-center">
                      <div className="text-white font-semibold text-lg">
                        {formatCurrency(investment.total_investment)}
                      </div>
                      <div className="text-green-400 text-sm">
                        Total Investment
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {investment.assets.length} asset{investment.assets.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Assets Preview */}
                    <div className="col-span-3">
                      <div className="flex flex-wrap gap-2">
                        {investment.assets.slice(0, 3).map((asset) => (
                          <div
                            key={asset.id}
                            className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600/50"
                          >
                            <img
                              src={getImageSrc(asset)}
                              alt={asset.title}
                              className="w-6 h-6 rounded object-cover"
                            />
                            <span className="text-white text-xs font-medium truncate max-w-20">
                              {asset.title}
                            </span>
                            <span className="text-green-400 text-xs">
                              {asset.invested_shares}s
                            </span>
                          </div>
                        ))}
                        {investment.assets.length > 3 && (
                          <div className="bg-gray-600/50 rounded-lg px-3 py-2 border border-gray-500/50">
                            <span className="text-gray-400 text-xs">
                              +{investment.assets.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedUser(investment);
                          setShowInvestmentsModal(true);
                        }}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Royalty Distribution Modal */}
        {showRoyaltyModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white">Distribute Royalties</h2>
                <button
                  onClick={() => setShowRoyaltyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Asset Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Select Asset
                  </label>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setDistributionData(prev => ({ ...prev, asset_id: asset.id }));
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selectedAsset?.id === asset.id
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageSrc(asset)}
                            alt={asset.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{asset.title}</h3>
                            <p className="text-gray-400 text-sm">{asset.artist}</p>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>{asset.type}</span>
                              <span>•</span>
                              <span>{asset.total_shares - asset.available_shares} invested shares</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribution Form */}
                {selectedAsset && (
                  <div className="space-y-4 border-t border-gray-700/50 pt-6">
                    <h3 className="text-lg font-semibold text-white">Royalty Distribution Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Total Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Total Royalty Pool ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={distributionData.total_amount}
                          onChange={(e) => setDistributionData(prev => ({
                            ...prev,
                            total_amount: parseFloat(e.target.value) || 0
                          }))}
                          className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter total royalty amount"
                        />
                      </div>

                      {/* Period */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Period
                        </label>
                        <input
                          type="month"
                          value={distributionData.period}
                          onChange={(e) => setDistributionData(prev => ({
                            ...prev,
                            period: e.target.value
                          }))}
                          className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Royalty Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Royalty Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={distributionData.royalty_rate}
                          onChange={(e) => setDistributionData(prev => ({
                            ...prev,
                            royalty_rate: parseFloat(e.target.value) || 0
                          }))}
                          className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Royalty Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Royalty Type
                        </label>
                        <select
                          value={distributionData.type}
                          onChange={(e) => setDistributionData(prev => ({
                            ...prev,
                            type: e.target.value as any
                          }))}
                          className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="streaming">Streaming</option>
                          <option value="sales">Sales</option>
                          <option value="performance">Performance</option>
                          <option value="mechanical">Mechanical</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Description
                      </label>
                      <textarea
                        value={distributionData.description}
                        onChange={(e) => setDistributionData(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        rows={3}
                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe this royalty distribution..."
                      />
                    </div>

                    {/* Auto Process Toggle */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="auto-process"
                        checked={distributionData.auto_process}
                        onChange={(e) => setDistributionData(prev => ({
                          ...prev,
                          auto_process: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="auto-process" className="text-sm text-gray-400">
                        Automatically process royalties to user wallets
                      </label>
                    </div>

                    {/* Distribution Result */}
                    {distributionResult && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                        <h4 className="text-green-400 font-semibold mb-2">Distribution Successful!</h4>
                        <div className="text-sm text-green-300 space-y-1">
                          <p>Total Distributed: ${distributionResult.total_distributed}</p>
                          <p>Investors Paid: {distributionResult.investors_count}</p>
                          <p>Royalty Pool: ${distributionResult.total_royalty_pool}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleDistributeRoyalties}
                        disabled={distributionLoading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {distributionLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Distributing...
                          </>
                        ) : (
                          'Distribute Royalties'
                        )}
                      </button>
                      <button
                        onClick={() => setShowRoyaltyModal(false)}
                        className="px-6 py-3 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Investments Detail Modal */}
        {showInvestmentsModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.user_name}'s Investments</h2>
                  <p className="text-gray-400">{selectedUser.user_email}</p>
                </div>
                <button
                  onClick={() => setShowInvestmentsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Investment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-blue-400 text-sm font-medium">Total Investment</div>
                    <div className="text-white font-bold text-xl">{formatCurrency(selectedUser.total_investment)}</div>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="text-green-400 text-sm font-medium">Assets Owned</div>
                    <div className="text-white font-bold text-xl">{selectedUser.assets.length}</div>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-purple-400 text-sm font-medium">Total Shares</div>
                    <div className="text-white font-bold text-xl">
                      {selectedUser.assets.reduce((sum: number, asset: Asset) => sum + (asset.invested_shares || 0), 0)}
                    </div>
                  </div>
                </div>

                {/* Assets List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Invested Assets</h3>
                  {selectedUser.assets.map((asset: Asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/50 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={getImageSrc(asset)}
                          alt={asset.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{asset.title}</h4>
                          <p className="text-gray-400 text-sm">{asset.artist}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span className="capitalize">{asset.type}</span>
                            <span>•</span>
                            <span>{asset.invested_shares} shares</span>
                            <span>•</span>
                            <span>{formatCurrency(asset.current_value || '0')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setDistributionData(prev => ({ ...prev, asset_id: asset.id }));
                            setShowInvestmentsModal(false);
                            setShowRoyaltyModal(true);
                          }}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/50 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                        >
                          Distribute Royalties
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDecision;