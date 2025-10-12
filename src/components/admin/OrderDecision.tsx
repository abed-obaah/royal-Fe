import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchPendingSellOrders,
  approveSellOrder,
  fetchOrderHistory,
  clearError
} from "../../slices/orderSlice";

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

const OrderDecision: React.FC<OrderDecisionProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingSellOrders, orderHistory, loading, error } = useSelector(
    (state: RootState) => state.order
  );

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "rejected">("all");

  useEffect(() => {
    dispatch(fetchPendingSellOrders());
  }, [dispatch]);

  const handleApproveReject = async (orderId: number, action: 'approve' | 'reject') => {
    setActionLoading(orderId);
    try {
      const result = await dispatch(approveSellOrder({ order_id: orderId, action })).unwrap();
      
      setShowSuccessMessage(`Order ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
      // Refresh pending orders data
      await dispatch(fetchPendingSellOrders());
      
      // Auto-hide success message
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

  const displayOrders = filteredPendingOrders;

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

  const totalPendingOrders = pendingOrders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
            <p className="text-gray-400">Approve or reject sell orders</p>
          </div>
          
          {/* Admin Stats */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-xl px-4 py-3">
              <div className="text-yellow-400 text-sm font-medium">Pending Orders</div>
              <div className="text-white font-bold text-lg">{totalPendingOrders}</div>
            </div>
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
                  Search Orders
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by asset name, user name, order reference, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
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
      </div>
    </div>
  );
};

export default OrderDecision;