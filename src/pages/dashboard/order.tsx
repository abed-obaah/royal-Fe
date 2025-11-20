import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../store";
import { 
  fetchPortfolio, 
  fetchSellOrders, 
  sellAsset,
  fetchOrderHistory,
  clearError
} from "../../slices/orderSlice";
import { InformationCircleIcon } from '@heroicons/react/24/outline';


interface PortfolioItem {
  id: number;
  name: string;
  company: string;
  price: string;
  change: string;
  logo: string;
  type: string;
  date: string;
  status: string;
  quantity: number;
  current_value: string;
  asset?: any;
}

const XchangePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { portfolio, sellOrders, orderHistory, loading, error } = useSelector(
    (state: RootState) => state.order
  );

  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"portfolio" | "history">("portfolio");
  const [sellModal, setSellModal] = useState<{ isOpen: boolean; item: any | null }>({
    isOpen: false,
    item: null,
  });
  const [sellQuantity, setSellQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchSellOrders());
    dispatch(fetchOrderHistory());
  }, [dispatch]);

  const handleSellClick = (item: any) => {
    setSellModal({ isOpen: true, item });
    setSellQuantity(1);
  };

  const handleSellSubmit = async () => {
    if (sellModal.item && sellQuantity > 0 && sellQuantity <= sellModal.item.quantity) {
      setActionLoading(`sell-${sellModal.item.id}`);
      try {
        await dispatch(sellAsset({
          portfolio_item_id: sellModal.item.id,
          quantity: sellQuantity
        })).unwrap();
        
        setSellModal({ isOpen: false, item: null });
        
        // Show success message first
        setShowSuccessMessage(true);
        
        // Refresh data in background without blocking UI
        Promise.all([
          dispatch(fetchPortfolio()),
          dispatch(fetchSellOrders()),
          dispatch(fetchOrderHistory())
        ]).catch(error => {
          console.error('Error refreshing data:', error);
        });
        
        // Auto-hide success message and redirect after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate('/dashboard');
        }, 3000);
        
      } catch (error) {
        console.error('Sell failed:', error);
        setShowSuccessMessage(false);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Helper function to get image source from base64 or URL
  // Helper function to get image source from base64 or URL with fallbacks
const getImageSrc = (asset: any) => {
  if (!asset) {
    return "https://via.placeholder.com/40";
  }
  
  // First try image_base64 from asset
  if (asset.image_base64) {
    if (asset.image_base64.startsWith('data:')) {
      return asset.image_base64;
    }
    return `data:image/jpeg;base64,${asset.image_base64}`;
  }
  
  // Then try image_url from asset
  if (asset.image_url) {
    return asset.image_url;
  }
  
  // Fallback to placeholder
  return "https://via.placeholder.com/40";
};

  // Convert portfolio items to display format - ONLY items with quantity > 0
// Convert portfolio items to display format - ONLY items with quantity > 0
const portfolioItems = (portfolio?.items || [])
  .filter(item => item.quantity > 0)
  .map(item => ({
    id: item.id,
    name: item.asset?.title || `Asset ${item.asset_id}`,
    company: item.asset?.artist || "Investment Co.",
    price: `$${parseFloat(item.current_price || item.asset?.price || '0').toFixed(2)}`,
    change: item.asset?.current_roi_percent ? 
      `${parseFloat(item.asset.current_roi_percent) > 0 ? '+' : ''}${parseFloat(item.asset.current_roi_percent).toFixed(1)}%` : "+0%",
    logo: getImageSrc(item.asset),
    type: item.asset_type || item.asset?.type || 'single',
    date: new Date().toISOString().split('T')[0],
    status: "Owned",
    quantity: item.quantity,
    current_value: item.current_value || "0",
    asset: item.asset, // Make sure asset object is passed through
    current_price: item.current_price || item.asset?.price || "0"
  }));

  // Convert sell orders to display format
  const orderItems = (sellOrders || []).map(order => ({
    id: order.id,
    name: order.asset?.title || `Asset ${order.asset_id}`,
    company: order.asset?.artist || "Investment Co.",
    price: `$${parseFloat(order.price || '0').toFixed(2)}`,
    change: order.asset?.current_roi_percent ? 
      `${parseFloat(order.asset.current_roi_percent) > 0 ? '+' : ''}${parseFloat(order.asset.current_roi_percent).toFixed(1)}%` : "+0%",
    logo: getImageSrc(order.asset),
    type: order.asset_type || order.order_type || 'single',
    date: new Date(order.created_at).toISOString().split('T')[0],
    status: order.status || 'pending',
    quantity: order.quantity || 0,
    total: order.total || "0",
    asset: order.asset,
    isOrder: true
  }));

  // Convert order history to display format
  const historyItems = (orderHistory || []).map(order => ({
    id: order.id,
    name: order.asset?.title || `Asset ${order.asset_id}`,
    company: order.asset?.artist || "Investment Co.",
    price: `$${parseFloat(order.price || '0').toFixed(2)}`,
    change: order.asset?.current_roi_percent ? 
      `${parseFloat(order.asset.current_roi_percent) > 0 ? '+' : ''}${parseFloat(order.asset.current_roi_percent).toFixed(1)}%` : "+0%",
    logo: getImageSrc(order.asset),
    type: order.asset_type || order.order_type || 'single',
    date: new Date(order.created_at).toISOString().split('T')[0],
    status: order.status || 'completed',
    quantity: order.quantity || 0,
    total: order.total || "0",
    asset: order.asset,
    order_type: order.order_type || 'sell',
    reference: order.reference || `REF-${order.id}`,
    isOrder: true
  }));

  // For portfolio tab: show owned items + sell orders
  // For history tab: show all orders
  const displayItems = activeTab === "portfolio" 
    ? [...portfolioItems, ...orderItems] 
    : historyItems;

  const filteredItems = activeFilter === "All" 
    ? displayItems 
    : displayItems.filter(item => item.type.toLowerCase() === activeFilter.toLowerCase());

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'owned':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'single':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'basket':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
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

  const getChangeColor = (change: string) => {
    if (change.includes('+')) return 'text-green-400';
    if (change.includes('-')) return 'text-red-400';
    return 'text-gray-400';
  };

  // Calculate portfolio statistics
  const totalPortfolioValue = portfolio?.total_value || "0";
  const totalItems = portfolioItems.length;
  const pendingOrders = sellOrders.filter(order => order.status === 'pending').length;
  const totalHistoryOrders = orderHistory.length;
    const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="min-h-screen bg-[#222629] p-6 md:p-8 rounded-2xl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">My Investment Portfolio</h1>
            <p className="text-gray-400">Manage your assets and track your investment performance</p>
          </div>
          
          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
 <div className="bg-gradient-to-r from-blue-500/20 to-emerald-600/20 border border-blue-500/30 rounded-xl px-4 py-3 w-full min-w-0 relative">
      <div className="text-blue-400 text-sm font-medium flex items-center gap-1">
        Portfolio Value
        {/* Info icon */}
        <InformationCircleIcon
          className="w-4 h-4 text-blue-400 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)} // optional click toggle for mobile
        />
      </div>
      <div className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl truncate">
        ${parseFloat(totalPortfolioValue).toFixed(2)}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-10 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
          ${parseFloat(totalPortfolioValue).toFixed(2)}
        </div>
      )}
    </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl px-4 py-3">
              <div className="text-green-400 text-sm font-medium">Total Assets</div>
              <div className="text-white font-bold text-lg">{totalItems}</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-xl px-4 py-3">
              <div className="text-yellow-400 text-sm font-medium">Pending Orders</div>
              <div className="text-white font-bold text-lg">{pendingOrders}</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 backdrop-blur-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sell order submitted successfully! Redirecting to dashboard...</span>
            </div>
            <button
              onClick={() => {
                setShowSuccessMessage(false);
                navigate('/dashboard');
              }}
              className="text-green-400 hover:text-green-300"
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700/50 mb-6">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all duration-200 ${
              activeTab === "portfolio"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            My Portfolio
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all duration-200 ${
              activeTab === "history"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Order History ({totalHistoryOrders})
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          {/* Filter Section */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-gray-400 font-medium">Filter {activeTab === "portfolio" ? "Assets" : "Orders"}:</span>
              {["All", "Single", "Basket"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => setActiveFilter(btn)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeFilter === btn 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" 
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white border border-gray-600/50"
                  }`}
                >
                  {btn}
                </button>
              ))}
              
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
                <span>Showing:</span>
                <span className="text-white font-semibold">{filteredItems.length} items</span>
              </div>
            </div>
          </div>

          {/* Table Section */}
     <div className="p-6">
  {/* Table Header */}
  <div className="grid gap-3 px-4 py-3 text-gray-400 text-xs sm:text-sm font-semibold border-b border-gray-700/50 mb-2 sm:grid-cols-12 grid-cols-2">
    {/* ASSET */}
    <div className="sm:col-span-4 col-span-1 text-left">
      ASSET
    </div>

    {/* TYPE */}
    <div className="text-right sm:col-span-2 col-span-1 sm:text-center">
      TYPE
    </div>

    {/* PRICE & CHANGE */}
    <div className="hidden sm:block sm:col-span-2 text-center">
      {activeTab === "portfolio" ? "PRICE & EPS" : "PRICE & QTY"}
    </div>

    {/* DATE */}
    <div className="hidden sm:block sm:col-span-2 text-center">
      DATE
    </div>

    {/* ACTIONS / STATUS */}
    <div className="hidden sm:block sm:col-span-2 text-right">
      {activeTab === "portfolio" ? "ACTIONS" : "STATUS"}
    </div>
  </div>

  {/* Table Body */}
  <div className="space-y-2">
    {loading && filteredItems.length === 0 ? (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    ) : filteredItems.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          {activeTab === "portfolio" ? "No investment items found" : "No order history found"}
        </div>
        <div className="text-gray-400 text-sm">
          {activeFilter !== "All" 
            ? `No ${activeFilter.toLowerCase()} ${activeTab === "portfolio" ? 'assets' : 'orders'} found` 
            : activeTab === "portfolio" 
              ? "You haven't made any investments yet"
              : "You haven't made any orders yet"}
        </div>
      </div>
    ) : (
      filteredItems.map((item, idx) => (
        <div
          key={`${item.id}-${idx}`}
          className="group bg-gray-700/20 hover:bg-gray-700/40 border border-transparent hover:border-gray-600/30 rounded-xl p-4 transition-all duration-200"
        >
          {/* Mobile Layout - Stacked */}
          <div className="lg:hidden space-y-4">
            {/* Header Section - Asset Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg shadow-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                    }}
                  />
                  {activeTab === "portfolio" && item.status === "Owned" && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-white">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {item.company}
                  </p>
                  {activeTab === "history" && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <p className="text-gray-500 text-xs">
                        Ref: {item.reference}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${getOrderTypeColor(item.order_type)}`}>
                        {item.order_type.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Type */}
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Type</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Price</p>
                <div className="text-white font-semibold text-sm">{item.price}</div>
              </div>

              {/* Change (Portfolio Only) */}
              {activeTab === "portfolio" && (
                <div className="space-y-1">
                  <p className="text-gray-400 text-xs">Change</p>
                  <div className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                    {item.change}
                  </div>
                </div>
              )}

              {/* Quantity (History Only) */}
              {activeTab === "history" && (
                <div className="space-y-1">
                  <p className="text-gray-400 text-xs">Quantity</p>
                  <div className="text-white text-sm">
                    {item.quantity}
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Date</p>
                <div className="text-gray-300 text-sm">{item.date}</div>
              </div>

              {/* Current Value (Portfolio Only) */}
              {activeTab === "portfolio" && item.status === "Owned" && (
                <div className="space-y-1 col-span-2">
                  <p className="text-gray-400 text-xs">Current Value</p>
                  <div className="text-white font-semibold text-sm">
                    ${parseFloat(item.current_value).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Total (History/Non-owned) */}
              {(activeTab === "history" || (activeTab === "portfolio" && item.status !== "Owned")) && (
                <div className="space-y-1 col-span-2">
                  <p className="text-gray-400 text-xs">Total</p>
                  <div className="text-white font-semibold text-sm">
                    ${parseFloat(item.total || "0").toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Sell Button */}
            {activeTab === "portfolio" && item.status === "Owned" && item.quantity > 0 && (
              <div className="pt-2 border-t border-gray-600/30">
                <button
                  onClick={() => handleSellClick(item)}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-semibold border border-red-500/30 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading === `sell-${item.id}` ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    "Sell Shares"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Desktop Layout - Grid */}
          <div className="hidden lg:grid gap-4 items-center grid-cols-12">
            {/* Asset Info */}
            <div className="col-span-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl shadow-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                    }}
                  />
                  {activeTab === "portfolio" && item.status === "Owned" && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate group-hover:text-blue-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {item.company}
                  </p>
                  {activeTab === "portfolio" && item.status === "Owned" && (
                    <p className="text-gray-500 text-xs mt-1">
                      {item.quantity} shares • ${parseFloat(item.current_value).toFixed(2)}
                    </p>
                  )}
                  {activeTab === "history" && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-500 text-xs">
                        Ref: {item.reference}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getOrderTypeColor(item.order_type)}`}>
                        {item.order_type.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {activeTab === "portfolio" && item.status !== "Owned" && (
                    <p className="text-gray-500 text-xs mt-1">
                      {item.quantity} shares • ${parseFloat(item.total || "0").toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Asset Type */}
            <div className="col-span-2 flex justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(item.type)}`}>
                {item.type}
              </span>
            </div>

            {/* Price & Change */}
            <div className="col-span-2 text-center">
              <div className="text-white font-semibold">{item.price}</div>
              {activeTab === "portfolio" && item.change && (
                <div className={`text-xs font-medium ${getChangeColor(item.change)}`}>
                  {item.change}
                </div>
              )}
              {activeTab === "history" && (
                <div className="text-gray-400 text-xs mt-1">
                  Qty: {item.quantity}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="col-span-2 text-center">
              <div className="text-gray-300 text-sm">{item.date}</div>
            </div>

            {/* Status & Actions */}
            <div className="col-span-2 flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
              
              {activeTab === "portfolio" && item.status === "Owned" && item.quantity > 0 && (
                <button
                  onClick={() => handleSellClick(item)}
                  disabled={actionLoading !== null}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold border border-red-500/30 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === `sell-${item.id}` ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Sell Shares"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>

        </div>
      </div>

      {/* Sell Modal */}
      {sellModal.isOpen && sellModal.item && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-2">Sell Investment Shares</h3>
              <p className="text-gray-400">Sell your shares of {sellModal.item.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Asset Info */}
              <div className="flex items-center gap-3 bg-gray-700/30 rounded-xl p-3 border border-gray-600/30">
                <img
                  src={sellModal.item.logo}
                  alt={sellModal.item.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                  }}
                />
                <div>
                  <h4 className="text-white font-semibold text-sm">{sellModal.item.name}</h4>
                  <p className="text-gray-400 text-xs">{sellModal.item.company}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Available: {sellModal.item.quantity} shares
                  </p>
                </div>
              </div>

  <div>
  <label className="block text-sm font-semibold text-gray-300 mb-2">
    Quantity to Sell
  </label>

  <div className="flex items-center gap-3">
    {/* Decrement Button */}
    <button
      onClick={() => {
        setSellQuantity((prev) => {
          const v = Number(prev) - 1;
          return v < 1 ? 1 : v;
        });
      }}
      className="px-3 py-2 bg-gray-600 rounded-lg text-white"
    >
      -
    </button>

    {/* Input */}
    <input
      type="number"
      min="1"
      max={sellModal.item.quantity}
      value={sellQuantity}
      onChange={(e) => {
        const value = e.target.value;

        // Allow empty string so user can type naturally
        if (value === "") {
          setSellQuantity("");
          return;
        }

        setSellQuantity(Number(value));
      }}
      onBlur={() => {
        let v = Number(sellQuantity);
        if (!v || v < 1) v = 1;
        if (v > sellModal.item.quantity) v = sellModal.item.quantity;
        setSellQuantity(v);
      }}
      className="w-24 text-center bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* Increment Button */}
    <button
      onClick={() => {
        setSellQuantity((prev) => {
          const v = Number(prev) + 1;
          return v > sellModal.item.quantity
            ? sellModal.item.quantity
            : v;
        });
      }}
      className="px-3 py-2 bg-gray-600 rounded-lg text-white"
    >
      +
    </button>

    <span className="text-gray-400 text-sm whitespace-nowrap">
      of {sellModal.item.quantity}
    </span>
  </div>

  {/* ⚠️ Error Message */}
  {Number(sellQuantity) > sellModal.item.quantity && (
    <p className="text-red-400 text-xs mt-1">
      Cannot sell more than available shares
    </p>
  )}
</div>



              
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="text-white font-semibold">{sellModal.item.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Estimated Proceeds:</span>
                  <span className="text-green-400 font-bold text-lg">
                    ${(parseFloat(sellModal.item.current_price) * sellQuantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-400 text-xs">Status after sale:</span>
                  <span className="text-yellow-400 text-xs font-medium">
                    Pending Admin Approval
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700/50 flex gap-3 justify-end">
              <button
                onClick={() => setSellModal({ isOpen: false, item: null })}
                disabled={actionLoading !== null}
                className="px-6 py-3 text-gray-400 hover:text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSellSubmit}
                disabled={sellQuantity < 1 || sellQuantity > sellModal.item.quantity || actionLoading !== null}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200"
              >
                {actionLoading !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Submit Sell Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XchangePage;