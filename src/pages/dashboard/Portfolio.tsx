import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaChartBar, FaWallet, FaGift, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { fetchPortfolio } from "../../slices/portfolioSlice";
import { RootState, AppDispatch } from "../../store";

export default function PortfolioDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { portfolio, loading } = useSelector((state: RootState) => state.portfolio);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  // Safe value handling with proper type checking
  const totalValue = portfolio?.total_value || 0;
  const items = portfolio?.items || [];

  // Safe number formatting function
  const formatCurrency = (value: any) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    return '0.00';
  };

  // Calculate allocation by asset type
  const allocation = items.reduce((acc: any, item) => {
    const type = item.asset_type || 'unknown';
    if (!acc[type]) {
      acc[type] = { value: 0, count: 0 };
    }
    const currentValue = typeof item.current_value === 'number' ? item.current_value : 0;
    acc[type].value += currentValue;
    acc[type].count += 1;
    return acc;
  }, {});

  // Safe image URL handling
  const getSafeImageUrl = (url: string) => {
    if (!url || url.includes('via.placenolder.com') || url.includes('placeholder.com')) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjM0E0MDQ2Ii8+CjxwYXRoIGQ9Ik0yNCAxNkMyMi45IDE2IDIyIDE2LjkgMjIgMThWMzBDMjIgMzEuMSAyMi45IDMyIDI0IDMyQzI1LjEgMzIgMjYgMzEuMSAyNiAzMFYxOEMyNiAxNi45IDI1LjEgMTYgMjQgMTZaIiBmaWxsPSIjNkI3Mjc3Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMyNS4xIDM2IDI2IDM1LjEgMjYgMzRDMjYgMzIuOSAyNS4xIDMyIDI0IDMyQzIyLjkgMzIgMjIgMzIuOSAyMiAzNEMyMiAzNS4xIDIyLjkgMzYgMjQgMzZaIiBmaWxsPSIjNkI3Mjc3Ii8+Cjwvc3ZnPgo=';
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="text-white text-center">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Header */}
      <header className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Portfolio</h1>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Asset Value & Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Asset Value */}
          <div className="bg-[#222629] rounded-2xl shadow p-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Total Portfolio Value</span>
            </div>
            <div className="flex items-center space-x-3 mt-2">
              <div className="text-4xl font-bold text-white">
                {showBalance ? `$${formatCurrency(totalValue)}` : "••••"}
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showBalance ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-green-600 font-semibold">
                +0.00 (0.00%)
              </span>
            </div>
          </div>

          {/* Allocation */}
          <div className="bg-[#222629] rounded-2xl shadow p-6">
            <h3 className="text-white font-semibold mb-4">Allocation</h3>
            {Object.keys(allocation).length > 0 ? (
              <>
                <div className="flex items-center justify-center h-24 border border-gray-600 rounded-lg text-gray-400 mb-4">
                  Chart would go here
                </div>
                <div className="space-y-2">
                  {Object.entries(allocation).map(([type, data]: [string, any]) => (
                    <div key={type} className="flex justify-between items-center text-gray-300">
                      <span className="font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                      <span>${formatCurrency(data.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No assets in portfolio
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Items */}
        <div className="bg-[#222629] rounded-2xl shadow p-6">
          <h3 className="text-white font-semibold mb-4">Your Assets</h3>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <img
                      src={getSafeImageUrl(item.asset?.image_url)}
                      alt={item.asset?.title || 'Asset'}
                      className="w-12 h-12 rounded-md object-cover mr-3"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjM0E0MDQ2Ii8+CjxwYXRoIGQ9Ik0yNCAxNkMyMi45IDE2IDIyIDE2LjkgMjIgMThWMzBDMjIgMzEuMSAyMi45IDMyIDI0IDMyQzI1LjEgMzIgMjYgMzEuMSAyNiAzMFYxOEMyNiAxNi45IDI1LjEgMTYgMjQgMTZaIiBmaWxsPSIjNkI3Mjc3Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMyNS4xIDM2IDI2IDM1LjEgMjYgMzRDMjYgMzIuOSAyNS4xIDMyIDI0IDMyQzIyLjkgMzIgMjIgMzIuOSAyMiAzNEMyMiAzNS4xIDIyLjkgMzYgMjQgMzZaIiBmaWxsPSIjNkI3Mjc3Ii8+Cjwvc3ZnPgo=';
                      }}
                    />
                    <div>
                      <h4 className="text-white font-medium text-sm">
                        {item.asset?.title || `Asset #${item.asset_id}`}
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {item.quantity || 0} shares
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Current Value</p>
                      <p className="text-white font-medium">${formatCurrency(item.current_value)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Avg Price</p>
                      <p className="text-white font-medium">${formatCurrency(item.purchase_price)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-xs">Current Price</p>
                      <p className="text-white font-medium">${formatCurrency(item.current_price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-gray-400 space-y-2 py-12">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FaWallet className="text-gray-500 text-4xl" />
              </div>
              <span className="text-lg">No assets in your portfolio</span>
              <span className="text-sm text-gray-500">Start investing to see your assets here</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}