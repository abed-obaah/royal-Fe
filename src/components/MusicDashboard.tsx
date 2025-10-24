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
    return `data:image/jpeg;base64,${asset.image_base64}`;
  }
  if (asset.image_url) {
    return asset.image_url;
  }
  return "https://via.placeholder.com/150";
};

// Smart text truncation function
const truncateText = (text: string, maxLength: number, useEllipsis: boolean = true) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  if (useEllipsis) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text.substring(0, maxLength);
};

// Function to format long titles intelligently
const formatAssetTitle = (title: string, isMobile: boolean) => {
  if (!title) return '';
  
  const maxLength = isMobile ? 20 : 28;
  
  if (title.length <= maxLength) return title;
  
  // Special handling for common patterns
  if (title.includes('(feat.')) {
    const [mainTitle, featPart] = title.split('(feat.');
    const truncatedMain = truncateText(mainTitle.trim(), isMobile ? 15 : 22, false);
    return `${truncatedMain}(feat.${truncateText(featPart, isMobile ? 8 : 12, true)}`;
  }
  
  if (title.includes('(with')) {
    const [mainTitle, withPart] = title.split('(with');
    const truncatedMain = truncateText(mainTitle.trim(), isMobile ? 15 : 22, false);
    return `${truncatedMain}(with${truncateText(withPart, isMobile ? 8 : 12, true)}`;
  }
  
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length >= 2) {
      const mainTitle = parts[0];
      const subtitle = parts.slice(1).join(' - ');
      const truncatedMain = truncateText(mainTitle, isMobile ? 15 : 20, false);
      const truncatedSub = truncateText(subtitle, isMobile ? 8 : 12, true);
      return `${truncatedMain} - ${truncatedSub}`;
    }
  }
  
  // Default truncation
  return truncateText(title, maxLength);
};

// Function to format artist names
const formatArtistName = (artist: string, isMobile: boolean) => {
  if (!artist) return 'Various Artists';
  
  const maxLength = isMobile ? 18 : 25;
  
  if (artist.length <= maxLength) return artist;
  
  // Handle featured artists in artist field
  if (artist.includes('feat.')) {
    const [mainArtist, featArtist] = artist.split('feat.');
    const truncatedMain = truncateText(mainArtist.trim(), isMobile ? 12 : 18, false);
    return `${truncatedMain} feat.${truncateText(featArtist, isMobile ? 8 : 12, true)}`;
  }
  
  if (artist.includes('&')) {
    const artists = artist.split('&');
    if (artists.length >= 2) {
      const mainArtist = artists[0].trim();
      const otherArtists = artists.slice(1).join(' & ');
      const truncatedMain = truncateText(mainArtist, isMobile ? 12 : 15, false);
      const truncatedOthers = truncateText(otherArtists, isMobile ? 8 : 12, true);
      return `${truncatedMain} & ${truncatedOthers}`;
    }
  }
  
  return truncateText(artist, maxLength);
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
  const [isMobile, setIsMobile] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState<Record<number, boolean>>({});

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  // Toggle title expansion
  const toggleTitleExpansion = (assetId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedTitles(prev => ({
      ...prev,
      [assetId]: !prev[assetId]
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
      
      const loadingToast = toast.loading(`Purchasing ${quantity} shares of ${asset.title}...`);
      
      await dispatch(buyAssetShares({
        id: asset.id,
        shares: quantity
      })).unwrap();
      
      toast.dismiss(loadingToast);
      toast.success(`Successfully purchased ${quantity} shares of "${asset.title}" for $${totalCost}!`, {
        position: isMobile ? "top-center" : "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      dispatch(fetchPortfolio());
      dispatch(fetchAssets({ per_page: 100, status: 'active' }));
      
      setQuantities(prev => ({
        ...prev,
        [asset.id]: 1
      }));
      
      setTimeout(() => setClickedIndex(null), 2000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      toast.dismiss();
      
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
            position: isMobile ? "top-center" : "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { background: '#1f2937', color: 'white' }
          }
        );
      } else if (error?.message?.includes('Sold out') || error?.response?.data?.message?.includes('available shares')) {
        toast.error(
          `"${asset.title}" is sold out or doesn't have enough available shares.`,
          {
            position: isMobile ? "top-center" : "top-right",
            autoClose: 5000,
          }
        );
      } else {
        toast.error(
          `Purchase "${asset.title}" failed due to insufficient funds. Please top up your balance and try again.`,
          {
            position: isMobile ? "top-center" : "top-right",
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
      position: isMobile ? "top-center" : "top-right",
      autoClose: 3000,
    });
  };

  const getFilteredAssets = () => {
    let filtered = [...assets];
    
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
      <div className="min-h-screen bg-[#1a1d21]">
        <WalletUi />
        <ToastContainer
          position={isMobile ? "top-center" : "top-right"}
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
          <div className="text-white text-lg">Loading assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <WalletUi/>

      {/* Toast Container */}
      <ToastContainer
        position={isMobile ? "top-center" : "top-right"}
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

      {/* Mobile Filter Bar */}
      {isMobile && (
        <Disclosure as="div" className="sticky top-0 z-40  border-b border-gray-700 p-3">
          {({ open }) => (
            <>
              <div className="flex items-center justify-between">
                <DisclosureButton className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-gray-700/50 px-3 py-2 rounded-lg">
                  <FunnelIcon className="h-4 w-4" />
                  Filters ({activeFilterCount})
                </DisclosureButton>
                
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center gap-1 text-sm font-medium text-gray-300 bg-gray-700/50 px-3 py-2 rounded-lg">
                    Sort
                    <ChevronDownIcon className="h-4 w-4" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
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

              {/* Mobile Filter Panel */}
              <DisclosurePanel className="mt-4">
                <div className="space-y-6">
                  {Object.entries(filters).map(([filterType, options]) => (
                    <fieldset key={filterType}>
                      <legend className="block font-medium text-gray-300 capitalize mb-3">
                        {filterType === 'roiRange' ? 'ROI' : filterType.replace(/_/g, ' ')}
                      </legend>
                      <div className="grid grid-cols-2 gap-2">
                        {options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`mobile-${filterType}-${optionIdx}`}
                              name={`${filterType}[]`}
                              defaultValue={option.value}
                              type="checkbox"
                              checked={activeFilters[filterType]?.includes(option.value) || false}
                              onChange={() => handleFilterChange(filterType, option.value)}
                              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`mobile-${filterType}-${optionIdx}`}
                              className="ml-2 text-sm text-gray-400"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  {activeFilterCount > 0 && (
                    <button 
                      type="button" 
                      className="w-full py-2 text-sm text-center text-gray-400 hover:text-gray-300 border border-gray-600 rounded-lg"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      )}

      {/* Filters Section - Desktop */}
      {!isMobile && (
        <Disclosure as="section" className="border-b border-gray-700 bg-[#222629] rounded-2xl m-4">
          {({ open }) => (
            <>
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
            </>
          )}
        </Disclosure>
      )}

      {/* Asset Grid */}
      <div className="p-3 sm:p-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {assets.length === 0 ? 'No assets available' : 'No assets match your filters'}
            </div>
            {assets.length === 0 && (
              <p className="text-gray-500 mt-2">Check back later for new investment opportunities.</p>
            )}
            {activeFilterCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-3 sm:gap-4 ${
            isMobile 
              ? 'grid-cols-1' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredAssets.map((asset, index) => {
              const quantity = quantities[asset.id] || 1;
              const totalCost = (asset.price * quantity).toFixed(2);
              const canBuy = asset.available_shares > 0;
              const imageSrc = getImageSrc(asset);
              const hasImageError = imageErrors[asset.id];
              const isTitleExpanded = expandedTitles[asset.id];
              const displayTitle = isTitleExpanded 
                ? asset.title 
                : formatAssetTitle(asset.title, isMobile);
              const displayArtist = formatArtistName(asset.artist, isMobile);
              const shouldShowExpand = asset.title && asset.title.length > (isMobile ? 20 : 28);
              
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
                        className={`rounded-md object-cover group-hover:scale-105 transition-transform duration-500 ${
                          isMobile ? 'w-14 h-14' : 'w-16 h-16'
                        }`}
                        onError={() => handleImageError(asset.id)}
                      />
                      <div className="absolute bottom-1 right-1 bg-gray-900/90 text-white font-medium py-0.5 px-1.5 rounded text-xs">
                        ${asset.price}
                      </div>
                    </div>
                    
                    <div className={`flex-grow min-w-0 ${isMobile ? 'ml-2' : 'ml-3'}`}>
                      {/* Title with expandable functionality */}
                      <div className="flex items-start justify-between group">
                        <h3 
                          className={`text-white font-medium ${
                            isMobile ? 'text-sm' : 'text-sm'
                          } break-words leading-tight cursor-pointer hover:text-blue-300 transition-colors`}
                          onClick={(e) => shouldShowExpand && toggleTitleExpansion(asset.id, e)}
                          title={asset.title}
                        >
                          {displayTitle}
                        </h3>
                        {shouldShowExpand && (
                          <button
                            onClick={(e) => toggleTitleExpansion(asset.id, e)}
                            className="ml-1 p-0.5 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            title={isTitleExpanded ? "Show less" : "Show full title"}
                          >
                            <svg 
                              className={`w-3 h-3 transform transition-transform ${
                                isTitleExpanded ? 'rotate-180' : ''
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* Artist name */}
                      <p 
                        className="text-gray-400 text-xs mt-1 truncate"
                        title={asset.artist || 'Various Artists'}
                      >
                        {displayArtist}
                      </p>
                      
                      <div className="flex items-center mt-1.5 flex-wrap gap-1">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getRiskColor(asset.risk_rating)} bg-gray-700/50`}>
                          {asset.risk_rating || 'Medium'}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-700/30 px-1.5 py-0.5 rounded-full capitalize">
                          {asset.type}
                        </span>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={() => handlePreviewClick(asset)}
                      className={`p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0 ${
                        isMobile ? 'ml-1' : 'ml-2'
                      }`}
                      title="Preview Asset"
                    >
                      <FaInfoCircle size={isMobile ? 14 : 16} />
                    </button>
                  </div>
                  
                  <div className={`grid gap-2 mb-3 ${
                    isMobile ? 'grid-cols-2' : 'grid-cols-2'
                  }`}>
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
                          <FaMinus size={isMobile ? 10 : 12} />
                        </button>
                        <span className="text-white font-medium mx-2 text-sm">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(asset.id, 1)}
                          disabled={quantity >= asset.available_shares}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaPlus size={isMobile ? 10 : 12} />
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