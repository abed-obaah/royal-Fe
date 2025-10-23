import React, { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCcw, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { 
  getRoyaltySummary, 
  getUserRoyalties, 
  type RoyaltySummary, 
  type RoyaltyEarning,
  type GetRoyaltiesParams 
} from "../../api/royalty";

export default function RewardPage() {
  const [showBalance, setShowBalance] = useState(false);
  const [royaltySummary, setRoyaltySummary] = useState<RoyaltySummary | null>(null);
  const [royaltyHistory, setRoyaltyHistory] = useState<RoyaltyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processed'>('all');

  // Fixed: Safe access with fallback values
  const balance = royaltySummary ? `$${(royaltySummary.total_earned || 0).toFixed(2)}` : "$0.00";
  const pendingBalance = royaltySummary ? `$${(royaltySummary.pending_earnings || 0).toFixed(2)}` : "$0.00";

  useEffect(() => {
    loadRoyaltyData();
  }, [filterStatus]);

  const loadRoyaltyData = async () => {
    try {
      setLoading(true);
      
      const params: GetRoyaltiesParams = {
        status: filterStatus === 'all' ? undefined : filterStatus,
        per_page: 10
      };

      const [summaryData, historyData] = await Promise.all([
        getRoyaltySummary(),
        getUserRoyalties(params)
      ]);
      
      setRoyaltySummary(summaryData);
      setRoyaltyHistory(historyData.royalties);
    } catch (error) {
      console.error('Error loading royalty data:', error);
      // Provide a more complete fallback structure
      setRoyaltySummary({
        total_earned: 0,
        pending_earnings: 0,
        total_earnings_count: 0,
        earnings_by_asset: []
      });
      setRoyaltyHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same...
  const formatPeriod = (period: string) => {
    if (period.includes('-Q')) {
      const [year, quarter] = period.split('-Q');
      return `Q${quarter} ${year}`;
    } else if (period.includes('-')) {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return period;
  };

  const getRoyaltyTypeIcon = (type: string) => {
    switch (type) {
      case 'streaming': return '🎵';
      case 'sales': return '💿';
      case 'performance': return '🎤';
      case 'mechanical': return '⚙️';
      default: return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d21] flex items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-white text-sm md:text-base">
          <RefreshCcw className="animate-spin w-5 h-5 md:w-6 md:h-6" />
          <span>Loading royalty data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d21] p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#3b4148] rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10">
          
          {/* Main Content Grid */}
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8">
            
            {/* Left Section - Main Content */}
            <div className="flex-1 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7">
              
              {/* Balance Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                
                {/* Total Earnings Card */}
                <div className="relative bg-[#001F54] rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-white min-h-[140px] sm:min-h-[150px] md:min-h-[160px] lg:min-h-[180px]">
                  <div className="absolute -top-2 sm:-top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-purple-600 px-3 sm:px-4 md:px-5 py-1 rounded-t-lg sm:rounded-t-xl text-xs font-medium shadow whitespace-nowrap">
                    Total Royalties Earned
                  </div>

                  <div className="flex justify-between items-start h-full pt-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs sm:text-sm md:text-base mb-1 md:mb-2 flex items-center gap-1 sm:gap-2">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        <span className="truncate">Lifetime Earnings</span>
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold break-words leading-tight">
                        {showBalance ? balance : "********"}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-200 mt-1 md:mt-2">
                        {royaltySummary?.total_earnings_count || 0} payments received
                      </p>
                    </div>

                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="flex-shrink-0 p-1.5 sm:p-2 md:p-2.5 rounded-full border border-white/30 hover:bg-white/20 transition-colors"
                      aria-label={showBalance ? "Hide balance" : "Show balance"}
                    >
                      {showBalance ? 
                        <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : 
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Pending Earnings Card */}
                <div className="relative bg-[#0A2E5C] rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-white min-h-[140px] sm:min-h-[150px] md:min-h-[160px] lg:min-h-[180px]">
                  <div className="absolute -top-2 sm:-top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-yellow-600 px-3 sm:px-4 md:px-5 py-1 rounded-t-lg sm:rounded-t-xl text-xs font-medium shadow whitespace-nowrap">
                    Pending Royalties
                  </div>

                  <div className="flex flex-col justify-between h-full pt-2">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm md:text-base mb-1 md:mb-2 flex items-center gap-1 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        <span className="truncate">Awaiting Processing</span>
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold break-words leading-tight">
                        {showBalance ? pendingBalance : "********"}
                      </p>
                    </div>
                    
                    <div className="mt-2 md:mt-3">
                      <p className="text-xs text-yellow-200 leading-tight">
                        These earnings will be processed to your wallet soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-gray-700/50 rounded-lg p-1">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'summary'
                        ? 'bg-[#001F54] text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Earnings Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'history'
                        ? 'bg-[#001F54] text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Payment History
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'summary' ? (
                <div>
                  <h3 className="font-semibold text-white text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 md:mb-5">
                    Earnings Summary
                  </h3>
                  
                  {royaltySummary?.earnings_by_asset && royaltySummary.earnings_by_asset.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {royaltySummary.earnings_by_asset.map((assetEarning) => (
                        <div
                          key={assetEarning.asset_id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/30 rounded-lg hover:bg-gray-600/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white text-sm sm:text-base truncate">
                                {assetEarning.asset.title}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-400 truncate">
                                {assetEarning.asset.artist}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-semibold text-white text-sm sm:text-base">
                              ${(assetEarning.total_earnings || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-green-400">Total Earned</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center text-gray-400 py-6 sm:py-8 md:py-10 space-y-3 sm:space-y-4 md:space-y-5">
                      <img
                        src="https://testapp.artsplit.com/images/empty.svg"
                        alt="No earnings"
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
                      />
                      <p className="font-medium text-gray-300 text-sm sm:text-base md:text-lg text-center">
                        No royalty earnings yet
                      </p>
                      <span className="text-xs sm:text-sm text-center max-w-xs sm:max-w-sm md:max-w-md text-gray-400 px-4">
                        Your royalty earnings from investments will appear here.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 md:mb-5">
                    <h3 className="font-semibold text-white text-base sm:text-lg md:text-xl lg:text-2xl">
                      Payment History
                    </h3>
                    <div className="flex space-x-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processed">Processed</option>
                      </select>
                      <button
                        onClick={loadRoyaltyData}
                        className="p-1.5 sm:p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex-shrink-0"
                      >
                        <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {royaltyHistory.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {royaltyHistory.map((royalty) => (
                        <div
                          key={royalty.id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/30 rounded-lg hover:bg-gray-600/50 transition-colors"
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base md:text-lg flex-shrink-0">
                              {getRoyaltyTypeIcon(royalty.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-xs sm:text-sm md:text-base truncate">
                                {royalty.asset?.title || 'Unknown Asset'}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 text-xs sm:text-sm text-gray-400 mt-0.5">
                                <span>{formatPeriod(royalty.period)}</span>
                                <span>•</span>
                                <span className="capitalize">{royalty.type}</span>
                                <span>•</span>
                                <span className={getStatusColor(royalty.status)}>
                                  {royalty.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {royalty.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-semibold text-white text-xs sm:text-sm md:text-base">
                              ${(royalty.amount || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-blue-400">{royalty.royalty_rate}% rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center text-gray-400 py-6 sm:py-8 md:py-10 space-y-3 sm:space-y-4 md:space-y-5">
                      <img
                        src="https://testapp.artsplit.com/images/empty.svg"
                        alt="No history"
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
                      />
                      <p className="font-medium text-gray-300 text-sm sm:text-base md:text-lg text-center">
                        No royalty history
                      </p>
                      <span className="text-xs sm:text-sm text-center max-w-xs sm:max-w-sm md:max-w-md text-gray-400 px-4">
                        Your royalty payment history will appear here once you start earning.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Section - Sidebar */}
            <div className="w-full xl:w-80 2xl:w-96 space-y-4 sm:space-y-5 md:space-y-6">
              
              {/* How Royalties Work */}
              <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 sm:mb-3">
                  How Royalties Work
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Earn passive income from your music investments through various royalty streams.
                  Your earnings are calculated based on your investment share and distributed regularly.
                </p>
              </div>

              {/* Royalty Types */}
              <div className="space-y-2 sm:space-y-3">
                {[
                  { 
                    color: "bg-blue-500", 
                    icon: "🎵", 
                    title: "Streaming Royalties", 
                    desc: "Earn from platforms like Spotify, Apple Music, YouTube" 
                  },
                  { 
                    color: "bg-green-500", 
                    icon: "💿", 
                    title: "Sales Royalties", 
                    desc: "Revenue from digital downloads and physical sales" 
                  },
                  { 
                    color: "bg-purple-500", 
                    icon: "🎤", 
                    title: "Performance Royalties", 
                    desc: "Earnings from radio play, live performances, and public broadcasts" 
                  },
                  { 
                    color: "bg-orange-500", 
                    icon: "⚙️", 
                    title: "Mechanical Royalties", 
                    desc: "Revenue from reproduction and distribution of music" 
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors cursor-pointer"
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 ${item.color} rounded-full flex justify-center items-center text-white text-sm sm:text-base flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-xs sm:text-sm md:text-base leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Royalty Information */}
              <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-white text-base sm:text-lg mb-2 sm:mb-3">Royalty Insights</h4>
                <ul className="text-xs sm:text-sm text-gray-400 space-y-1.5 sm:space-y-2">
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                    <span>Royalties are distributed monthly or quarterly based on revenue</span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                    <span>Your share is proportional to your investment in each asset</span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                    <span>Pending royalties are processed within 7-14 business days</span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                    <span>Track different royalty types to understand your revenue streams</span>
                  </li>
                </ul>
              </div>

              {/* Quick Stats */}
              {royaltySummary && (
                <div className="bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-700/30 p-3 sm:p-4">
                  <h4 className="font-semibold text-white text-base sm:text-lg mb-2 sm:mb-3">Your Royalty Stats</h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-400">Total Payments</p>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {royaltySummary.total_earnings_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Assets Earning</p>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {royaltySummary.earnings_by_asset?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}