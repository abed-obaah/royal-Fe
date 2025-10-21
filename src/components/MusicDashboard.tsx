import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid';
import { FaInfoCircle, FaPlus, FaMinus } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletUi from './WalletUI';
import { fetchPortfolio } from "../slices/portfolioSlice";
import { fetchAssets, buyAssetShares } from "../slices/assetSlice";
import { RootState, AppDispatch } from "../store";
import AssetPreviewModal from "./AssetPreviewModal";

// Filters configuration
const filters = {
  genre: [
    { value: 'Hip-Hop', label: 'Hip-Hop', checked: false },
    { value: 'Pop', label: 'Pop', checked: false },
    { value: 'Rock', label: 'Rock', checked: false },
    { value: 'Electronic', label: 'Electronic', checked: false },
    { value: 'R&B', label: 'R&B', checked: false },
    { value: 'Classical', label: 'Classical', checked: false },
    { value: 'Jazz', label: 'Jazz', checked: false },
  ],
  risk_rating: [
    { value: 'High', label: 'High', checked: false },
    { value: 'Medium', label: 'Medium', checked: false },
    { value: 'Low', label: 'Low', checked: false },
  ],
  roiRange: [
    { value: '0-10', label: '0-10%', checked: false },
    { value: '10-20', label: '10-20%', checked: false },
    { value: '20-30', label: '20-30%', checked: false },
    { value: '30+', label: '30%+', checked: false },
  ],
  type: [
    { value: 'single', label: 'Single', checked: false },
    { value: 'basket', label: 'Basket', checked: false },
  ],
};

const sortOptions = [
  { name: 'Price: Low to High', value: 'price-asc', current: false },
  { name: 'Price: High to Low', value: 'price-desc', current: false },
  { name: 'ROI: Low to High', value: 'roi-asc', current: false },
  { name: 'ROI: High to Low', value: 'roi-desc', current: true },
  { name: 'Available Shares: Low to High', value: 'shares-asc', current: false },
  { name: 'Available Shares: High to Low', value: 'shares-desc', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Helper function to get image source from base64 or URL
const getImageSrc = (asset: any) => {
  if (asset.image_base64) {
    // Handle base64 image data
    return `data:image/jpeg;base64,${asset.image_base64}`;
  }
  if (asset.image_url) {
    // Handle regular image URL
    return asset.image_url;
  }
  // Fallback placeholder
  return "https://via.placeholder.com/150";
};

export default function AlbumGrid() {
  const dispatch = useDispatch<AppDispatch>();
  const { portfolio, loading: portfolioLoading } = useSelector((state: RootState) => state.portfolio);
  const { assets, loading: assetsLoading, buyLoading } = useSelector((state: RootState) => state.assets);
  
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('roi-desc');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchAssets({ per_page: 100, status: 'active' }));
  }, [dispatch]);

  // Handle image loading errors
  const handleImageError = (assetId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [assetId]: true
    }));
  };

  // Handle quantity changes
  const handleQuantityChange = (assetId: number, change: number) => {
    setQuantities(prev => {
      const currentQty = prev[assetId] || 1;
      const asset = assets.find(a => a.id === assetId);
      const maxShares = asset?.available_shares || 1;
      
      let newQty = currentQty + change;
      newQty = Math.max(1, Math.min(newQty, maxShares));
      
      return {
        ...prev,
        [assetId]: newQty
      };
    });
  };

  // Handle buy click with quantity
  const handleBuyClick = async (asset: any, index: number) => {
    try {
      setClickedIndex(index);
      
      const quantity = quantities[asset.id] || 1;
      const totalCost = (asset.price * quantity).toFixed(2);
      
      // Show loading toast
      const loadingToast = toast.loading(`Purchasing ${quantity} shares of ${asset.title}...`);
      
      // Use the asset slice's buyAssetShares
      await dispatch(buyAssetShares({
        id: asset.id,
        shares: quantity
      })).unwrap();
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Successfully purchased ${quantity} shares of "${asset.title}" for $${totalCost}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh portfolio to get updated balances
      dispatch(fetchPortfolio());
      
      // Refresh assets to get updated available shares
      dispatch(fetchAssets({ per_page: 100, status: 'active' }));
      
      // Reset quantity for this asset
      setQuantities(prev => ({
        ...prev,
        [asset.id]: 1
      }));
      
      setTimeout(() => setClickedIndex(null), 2000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      // Dismiss any loading toasts
      toast.dismiss();
      
      // Handle insufficient funds error
      if (error?.message?.includes('Insufficient funds') || error?.response?.data?.message?.includes('Insufficient funds')) {
        const quantity = quantities[asset.id] || 1;
        const totalCost = (asset.price * quantity).toFixed(2);
        const shortfall = error?.response?.data?.shortfall || '0.00';
        const available = error?.response?.data?.available || '0.00';
        
        toast.error(
          <div>
            <div className="font-semibold">Insufficient Funds</div>
            <div className="text-sm mt-1">
              You need ${totalCost} but only have ${available} available.
              <br />
              <span className="text-yellow-300">Shortfall: ${shortfall}</span>
            </div>
            <div className="text-xs mt-2 text-gray-300">
              Please add funds to your wallet to complete this purchase.
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { background: '#1f2937', color: 'white' }
          }
        );
      } else if (error?.message?.includes('Sold out') || error?.response?.data?.message?.includes('available shares')) {
        // Handle sold out or insufficient shares
        toast.error(
          `"${asset.title}" is sold out or doesn't have enough available shares.`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      } else {
        // Handle other errors
        toast.error(
          `Purchase "${asset.title}" failed due to insufficient funds. Please top up your balance and try again. `,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }
      
      setClickedIndex(null);
    }
  };

  const handlePreviewClick = (asset: any) => {
    setSelectedAsset(asset);
    setShowPreview(true);
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case "High": return "text-red-500";
      case "Medium": return "text-yellow-500";
      case "Low": return "text-green-500";
      default: return "text-gray-400";
    }
  };

  const getROIColor = (roi: number) => {
    return roi > 0 ? "text-green-400" : "text-red-400";
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[filterType]) {
        newFilters[filterType] = [];
      }
      
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType];
        }
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    toast.info("All filters cleared", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const getFilteredAssets = () => {
    let filtered = [...assets];
    
    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter(asset => {
        return Object.entries(activeFilters).every(([key, values]) => {
          if (key === 'roiRange') {
            const roiValue = asset.current_roi_percent || 0;
            return values.some(range => {
              if (range === '0-10') return roiValue >= 0 && roiValue <= 10;
              if (range === '10-20') return roiValue > 10 && roiValue <= 20;
              if (range === '20-30') return roiValue > 20 && roiValue <= 30;
              if (range === '30+') return roiValue > 30;
              return false;
            });
          }
          return values.includes(asset[key]);
        });
      });
    }
    
    // Apply sorting
    switch(sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'roi-asc':
        filtered.sort((a, b) => (a.current_roi_percent || 0) - (b.current_roi_percent || 0));
        break;
      case 'roi-desc':
        filtered.sort((a, b) => (b.current_roi_percent || 0) - (a.current_roi_percent || 0));
        break;
      case 'shares-asc':
        filtered.sort((a, b) => a.available_shares - b.available_shares);
        break;
      case 'shares-desc':
        filtered.sort((a, b) => b.available_shares - a.available_shares);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const filteredAssets = getFilteredAssets();
  const activeFilterCount = Object.values(activeFilters).flat().length;

  if (assetsLoading) {
    return (
      <div className="min-h-screen ">
        <WalletUi />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <div className="flex justify-center items-center py-12">
          <div className="text-white">Loading assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <WalletUi/>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Filters Section */}
      <Disclosure as="section" className="border-b border-gray-700 bg-[#222629] rounded-2xl m-4">
        <h2 className="sr-only">Filters</h2>
        <div className="relative py-4">
          <div className="mx-auto flex max-w-7xl justify-between items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <DisclosureButton className="group flex items-center font-medium text-gray-300">
                <FunnelIcon
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 flex-none text-gray-400 group-hover:text-gray-300"
                />
                {activeFilterCount} Filter{activeFilterCount !== 1 ? 's' : ''}
              </DisclosureButton>
              {activeFilterCount > 0 && (
                <button 
                  type="button" 
                  className="ml-4 text-sm text-gray-400 hover:text-gray-300"
                  onClick={clearAllFilters}
                >
                  Clear all
                </button>
              )}
            </div>
            
            <Menu as="div" className="relative inline-block">
              <div className="flex">
                <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-300 hover:text-white">
                  Sort by
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="-mr-1 ml-1 h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-300"
                  />
                </MenuButton>
              </div>

              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value}>
                      {({ focus }) => (
                        <button
                          onClick={() => setSortBy(option.value)}
                          className={classNames(
                            option.value === sortBy ? 'font-medium text-white' : 'text-gray-400',
                            focus ? 'bg-gray-700' : '',
                            'block w-full px-4 py-2 text-left text-sm'
                          )}
                        >
                          {option.name}
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
        
        <DisclosurePanel className="border-t border-gray-700">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {Object.entries(filters).map(([filterType, options]) => (
                <fieldset key={filterType}>
                  <legend className="block font-medium text-gray-300 capitalize">
                    {filterType === 'roiRange' ? 'ROI' : filterType.replace(/_/g, ' ')}
                  </legend>
                  <div className="space-y-4 pt-4">
                    {options.map((option, optionIdx) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`${filterType}-${optionIdx}`}
                          name={`${filterType}[]`}
                          defaultValue={option.value}
                          type="checkbox"
                          checked={activeFilters[filterType]?.includes(option.value) || false}
                          onChange={() => handleFilterChange(filterType, option.value)}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`${filterType}-${optionIdx}`}
                          className="ml-3 text-sm text-gray-400"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Asset Grid */}
      <div className="p-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {assets.length === 0 ? 'No assets available' : 'No assets match your filters'}
            </div>
            {assets.length === 0 && (
              <p className="text-gray-500 mt-2">Check back later for new investment opportunities.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset, index) => {
              const quantity = quantities[asset.id] || 1;
              const totalCost = (asset.price * quantity).toFixed(2);
              const canBuy = asset.available_shares > 0;
              const imageSrc = getImageSrc(asset);
              const hasImageError = imageErrors[asset.id];
              
              return (
                <div
                  key={asset.id}
                  className="bg-[#222629] rounded-lg p-3 hover:bg-gray-750 transition-all duration-300 hover:shadow-md group border border-gray-700"
                >
                  <div className="flex mb-3">
                    <div className="relative overflow-hidden rounded-md flex-shrink-0">
                      <img
                        src={hasImageError ? "https://via.placeholder.com/150" : imageSrc}
                        alt={asset.title}
                        className="rounded-md w-16 h-16 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => handleImageError(asset.id)}
                      />
                      <div className="absolute bottom-1 right-1 bg-gray-900/90 text-white font-medium py-0.5 px-1.5 rounded text-xs">
                        ${asset.price}
                      </div>
                    </div>
                    
                    <div className="ml-3 flex-grow">
                      <h3 className="text-white font-medium text-sm truncate">{asset.title}</h3>
                      <p className="text-gray-400 text-xs">{asset.artist || 'Various Artists'}</p>
                      
                      <div className="flex items-center mt-1">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getRiskColor(asset.risk_rating)} bg-gray-700/50`}>
                          {asset.risk_rating || 'Medium'}
                        </span>
                        <span className="ml-1 text-xs text-gray-400 bg-gray-700/30 px-1.5 py-0.5 rounded-full capitalize">
                          {asset.type}
                        </span>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={() => handlePreviewClick(asset)}
                      className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                      title="Preview Asset"
                    >
                      <FaInfoCircle size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-700/30 p-2 rounded-md">
                      <p className="text-gray-400 text-xs mb-0.5">ROI Range</p>
                      <p className="text-white font-medium text-sm">
                        {asset.expected_roi_range || '10-20%'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-700/30 p-2 rounded-md">
                      <p className="text-gray-400 text-xs mb-0.5">Entry Price</p>
                      <p className="text-white font-medium text-sm">${asset.price}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 p-2 rounded-md col-span-2">
                      <p className="text-gray-400 text-xs mb-0.5">Current ROI</p>
                      <p className={`font-medium text-sm ${getROIColor(asset.current_roi_percent)}`}>
                        {asset.current_roi_percent > 0 ? '+' : ''}{asset.current_roi_percent || 0}%
                      </p>
                    </div>

                    <div className="bg-gray-700/30 p-2 rounded-md col-span-2">
                      <p className="text-gray-400 text-xs mb-0.5">Available Shares</p>
                      <p className="text-white font-medium text-sm">
                        {asset.available_shares} / {asset.total_shares}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quantity Selector */}
                  {canBuy && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">Quantity:</span>
                        <span className="text-white text-xs font-medium">
                          Total: ${totalCost}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-700/30 rounded-lg p-2">
                        <button
                          onClick={() => handleQuantityChange(asset.id, -1)}
                          disabled={quantity <= 1}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="text-white font-medium mx-2">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(asset.id, 1)}
                          disabled={quantity >= asset.available_shares}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleBuyClick(asset, index)}
                    disabled={portfolioLoading || buyLoading || !canBuy}
                    className={`w-full relative overflow-hidden font-medium py-2 rounded-lg transition-all duration-300 text-xs ${
                      clickedIndex === index 
                        ? 'bg-green-500 text-white scale-95' 
                        : !canBuy
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span className={`flex items-center justify-center transition-all duration-200 ${clickedIndex === index ? 'scale-110' : ''}`}>
                      {!canBuy ? (
                        "Sold Out"
                      ) : clickedIndex === index ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Purchased!
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Invest ${totalCost}
                        </>
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Asset Preview Modal */}
      <AssetPreviewModal
        asset={selectedAsset}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onInvest={(asset, quantity) => {
          const index = assets.findIndex(a => a.id === asset.id);
          handleBuyClick(asset, index);
          setShowPreview(false);
        }}
      />
    </div>
  );
}