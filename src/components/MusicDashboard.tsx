import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon, ExclamationTriangleIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/20/solid';
import { FaInfoCircle, FaPlus, FaMinus, FaSearch, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletUi from './WalletUI';
import { fetchPortfolio } from "../slices/portfolioSlice";
import { fetchAssets, buyAssetShares } from "../slices/assetSlice";
import { RootState, AppDispatch } from "../store";
import AssetPreviewModal from "./AssetPreviewModal";

// Filters configuration
const filtersConfig = {
  genre: [
    { value: 'Hip-Hop', label: 'Hip-Hop', checked: false },
    { value: 'Pop', label: 'Pop', checked: false },
    { value: 'Afrobeats', label: 'Afrobeats', checked: false },
    { value: 'Latin', label: 'Latin', checked: false },
    { value: 'R&B', label: 'R&B', checked: false },
    { value: 'Dance', label: 'Dance', checked: false },
    { value: 'Rock', label: 'Rock', checked: false },
    { value: 'Country', label: 'Country', checked: false },
    { value: 'Gospel', label: 'Gospel', checked: false },
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
  status: [
    { value: 'active', label: 'Active', checked: false },
    { value: 'sold_out', label: 'Sold Out', checked: false },
  ]
};

const sortOptions = [
  { name: 'Price: Low to High', value: 'price-asc', current: false },
  { name: 'Price: High to Low', value: 'price-desc', current: false },
  { name: 'ROI: Low to High', value: 'roi-asc', current: false },
  { name: 'ROI: High to Low', value: 'roi-desc', current: true },
  { name: 'Available Shares: Low to High', value: 'shares-asc', current: false },
  { name: 'Available Shares: High to Low', value: 'shares-desc', current: false },
  { name: 'Recently Added', value: 'newest', current: false },
  { name: 'Name: A-Z', value: 'name-asc', current: false },
  { name: 'Name: Z-A', value: 'name-desc', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Helper function to get image source from base64 or URL
const getImageSrc = (asset: any) => {
  if (asset?.image_base64) {
    return `data:image/jpeg;base64,${asset.image_base64}`;
  }
  if (asset?.image_url) {
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

interface MusicDashboardProps {
  verificationStatus: string;
  onKYCRequired?: () => void;
}

export default function MusicDashboard({ verificationStatus, onKYCRequired }: MusicDashboardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { portfolio, loading: portfolioLoading } = useSelector((state: RootState) => state.portfolio);
  const { assets, loading: assetsLoading, buyLoading } = useSelector((state: RootState) => state.assets);
  
  // Wallet state
  const wallet = useSelector((state: RootState) => 
    state.wallet || state.user?.wallet || state.auth?.user?.wallet
  );
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('roi-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState<Record<number, boolean>>({});

  const isKYCVerified = verificationStatus === 'approved';
  const isKYCPending = verificationStatus === 'pending';

  // Use wallet data from Redux or API fallback
  const availableBalance = Number(
    wallet?.available_balance || 
    walletData?.available_balance || 
    0
  );
  
  const hasSufficientFunds = availableBalance > 10;

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

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const response = await fetch('/api/wallet');
      const data = await response.json();
      setWalletData(data);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (!wallet) {
      fetchWalletData();
    }
  }, [wallet]);

  // Filter functions
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
    setSearchQuery('');
    toast.info("All filters cleared", {
      position: isMobile ? "top-center" : "top-right",
      autoClose: 3000,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).flat().length + (searchQuery ? 1 : 0);
  };

  // Filter and sort assets
  const getFilteredAssets = () => {
    let filtered = [...assets];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.title?.toLowerCase().includes(query) ||
        asset.artist?.toLowerCase().includes(query) ||
        asset.genre?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filters
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
          
          if (key === 'status') {
            if (values.includes('sold_out')) {
              return asset.available_shares === 0;
            }
            if (values.includes('active')) {
              return asset.available_shares > 0;
            }
          }
          
          return values.includes(asset[key]);
        });
      });
    }
    
    // Sort assets
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
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const filteredAssets = getFilteredAssets();
  const activeFilterCount = getActiveFilterCount();

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

  // Handle deposit required - navigate to wallet page
  const handleDepositRequired = () => {
    window.location.href = '/wallet';
  };

  // Handle KYC requirement
  const handleKYCRequirement = (asset: any) => {
    if (!isKYCVerified) {
      toast.error(
        <div>
          <div className="font-semibold">KYC Verification Required</div>
          <div className="text-sm mt-1">
            You need to complete identity verification to make investments.
          </div>
          <div className="text-xs mt-2 text-gray-300">
            Complete KYC to unlock all investment features.
          </div>
        </div>,
        {
          position: isMobile ? "top-center" : "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { background: '#1f2937', color: 'white' }
        }
      );

      if (onKYCRequired) {
        onKYCRequired();
      }
      
      return true;
    }
    return false;
  };

  // Handle buy click with quantity
  const handleBuyClick = async (asset: any, index: number) => {
    if (handleKYCRequirement(asset)) {
      return;
    }

    try {
      setClickedIndex(index);
      
      const quantity = quantities[asset.id] || 1;
      const totalCost = (asset.price * quantity).toFixed(2);
      
      const loadingToast = toast.loading(`Purchasing ${quantity} shares of ${asset.title}...`);
      
      await dispatch(buyAssetShares({
        id: asset.id,
        shares: quantity,
        quantity: quantity,
        share_quantity: quantity
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
      
      const errorMessage = error?.response?.data?.message || error?.message || `Purchase failed for "${asset.title}". Please try again.`;
      
      toast.error(errorMessage, {
        position: isMobile ? "top-center" : "top-right",
        autoClose: 5000,
      });
      
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

      {/* KYC Warning Banner */}
      {!isKYCVerified && (
        <div className="mb-4 mx-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Complete Verification to Invest
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                You need to complete KYC verification to access investment opportunities and withdraw funds.
              </p>
              {onKYCRequired && (
                <button
                  onClick={onKYCRequired}
                  className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Complete KYC Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Section */}
<div className="p-4 border-b border-gray-700/50">
  <div className="max-w-7xl mx-auto">
    {/* Top Bar - Search, Sort, View Toggle */}
    <div className="flex flex-col lg:flex-row gap-4 mb-4">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets, artists, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Sort and View Controls */}
      <div className="flex items-center gap-2">
        {/* Sort Dropdown - Fixed responsive positioning */}
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors">
            <span>Sort</span>
            <ChevronDownIcon className="w-4 h-4" />
          </MenuButton>
          <MenuItems className="absolute left-0 lg:left-auto lg:right-0 z-10 mt-1 w-56 origin-top-right rounded-lg bg-gray-800 border border-gray-600 shadow-lg focus:outline-none">
            <div className="py-1">
              {sortOptions.map((option) => (
                <MenuItem key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => setSortBy(option.value)}
                      className={classNames(
                        active ? 'bg-gray-700 text-white' : 'text-gray-300',
                        'block w-full px-3 py-1.5 text-left text-sm',
                        sortBy === option.value ? 'bg-blue-600 text-white' : ''
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

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>

    {/* Filter Panel */}
    {showFilters && (
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Filters</h3>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-400 hover:text-white"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Horizontal Layout for iPad and Desktop, Vertical for Mobile */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
          {/* Genres - Always first column */}
          <div className="flex-1 min-w-0">
            <Disclosure defaultOpen>
              {({ open }) => (
                <>
                  <DisclosureButton className="flex justify-between w-full px-3 py-2 text-sm font-medium text-left text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors mb-2">
                    <span>Genres</span>
                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                  </DisclosureButton>
                  <DisclosurePanel className="grid grid-cols-1 gap-1">
                    {filtersConfig.genre.map((filter) => (
                      <label 
                        key={filter.value} 
                        className="flex items-center text-xs text-gray-300 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={activeFilters.genre?.includes(filter.value) || false}
                          onChange={() => handleFilterChange('genre', filter.value)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="truncate">{filter.label}</span>
                      </label>
                    ))}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>

          {/* ROI Range */}
          <div className="flex-1 min-w-0">
            <Disclosure defaultOpen>
              {({ open }) => (
                <>
                  <DisclosureButton className="flex justify-between w-full px-3 py-2 text-sm font-medium text-left text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors mb-2">
                    <span>ROI Range</span>
                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                  </DisclosureButton>
                  <DisclosurePanel className="grid grid-cols-1 gap-1">
                    {filtersConfig.roiRange.map((filter) => (
                      <label key={filter.value} className="flex items-center text-xs text-gray-300 py-1">
                        <input
                          type="checkbox"
                          checked={activeFilters.roiRange?.includes(filter.value) || false}
                          onChange={() => handleFilterChange('roiRange', filter.value)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="truncate">{filter.label}</span>
                      </label>
                    ))}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>

          {/* Asset Type */}
          <div className="flex-1 min-w-0">
            <Disclosure defaultOpen>
              {({ open }) => (
                <>
                  <DisclosureButton className="flex justify-between w-full px-3 py-2 text-sm font-medium text-left text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors mb-2">
                    <span>Asset Type</span>
                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                  </DisclosureButton>
                  <DisclosurePanel className="grid grid-cols-1 gap-1">
                    {filtersConfig.type.map((filter) => (
                      <label key={filter.value} className="flex items-center text-xs text-gray-300 py-1">
                        <input
                          type="checkbox"
                          checked={activeFilters.type?.includes(filter.value) || false}
                          onChange={() => handleFilterChange('type', filter.value)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="truncate">{filter.label}</span>
                      </label>
                    ))}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>

          {/* Status - Last column */}
          <div className="flex-1 min-w-0">
            <div className="px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg mb-2">
              Status
            </div>
            <div className="grid grid-cols-1 gap-1">
              {filtersConfig.status.map((filter) => (
                <label key={filter.value} className="flex items-center text-xs text-gray-300 py-1">
                  <input
                    type="checkbox"
                    checked={activeFilters.status?.includes(filter.value) || false}
                    onChange={() => handleFilterChange('status', filter.value)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="truncate">{filter.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>



      {/* Results Summary */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            {/* <div className="text-gray-400">
              Showing <span className="text-white font-semibold">{filteredAssets.length}</span> of{' '}
              <span className="text-white font-semibold">{assets.length}</span> assets
              {searchQuery && (
                <span> for "<span className="text-white font-semibold">{searchQuery}</span>"</span>
              )}
            </div> */}
            
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <FaTimes className="w-3 h-3" />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="p-3 sm:p-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              No assets found
            </div>
            <p className="text-gray-500 mb-4">
              {assets.length === 0 
                ? 'No assets available at the moment.' 
                : 'Try adjusting your search or filters to find what you\'re looking for.'}
            </p>
            {(searchQuery || activeFilterCount > 0) && (
              <button 
                onClick={clearAllFilters}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-3 sm:gap-4 ${
            viewMode === 'grid'
              ? isMobile 
                ? 'grid-cols-1' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
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
                  className={`bg-[#222629] rounded-lg p-3 hover:bg-gray-750 transition-all duration-300 hover:shadow-md group border border-gray-700 ${
                    viewMode === 'list' ? 'flex items-start gap-4' : ''
                  }`}
                >
                  {viewMode === 'list' && (
                    <div className="flex-shrink-0">
                      <div className="relative overflow-hidden rounded-md">
                        <img
                          src={hasImageError ? "" : imageSrc}
                          alt={asset.title}
                          className="w-16 h-16 rounded-md object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={() => handleImageError(asset.id)}
                        />
                      </div>
                    </div>
                  )}

                  <div className={`flex ${viewMode === 'list' ? 'flex-1 min-w-0' : 'flex-col'}`}>
                    {viewMode === 'grid' && (
                      <div className="flex mb-3">
                        <div className="relative overflow-hidden rounded-md flex-shrink-0">
                          <img
                            src={hasImageError ? "" : imageSrc}
                            alt={asset.title}
                            className={`rounded-md object-cover group-hover:scale-105 transition-transform duration-500 ${
                              isMobile ? 'w-14 h-14' : 'w-16 h-16'
                            }`}
                            onError={() => handleImageError(asset.id)}
                          />
                        </div>
                        
                        <div className={`flex-grow min-w-0 ${isMobile ? 'ml-2' : 'ml-3'}`}>
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
                          
                          <p 
                            className="text-gray-400 text-xs mt-1 truncate"
                            title={asset.artist || 'Various Artists'}
                          >
                            {displayArtist}
                          </p>
                          
                         <div className="flex items-center mt-1.5 flex-nowrap gap-2 min-w-0">
<span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${getRiskColor(asset.risk_rating)} bg-gray-700/50`}>
  {(asset.risk_rating || 'Medium').charAt(0).toUpperCase() + (asset.risk_rating || 'Medium').slice(1).toLowerCase()}
</span>
  <span className="text-xs text-gray-400 bg-gray-700/30 px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 whitespace-nowrap">
    {asset.type}
  </span>
</div>
                        </div>

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
                    )}

                    {viewMode === 'list' && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <h3 
                                className="text-white font-medium text-sm break-words leading-tight cursor-pointer hover:text-blue-300 transition-colors"
                                onClick={(e) => shouldShowExpand && toggleTitleExpansion(asset.id, e)}
                                title={asset.title}
                              >
                                {displayTitle}
                              </h3>
                              {shouldShowExpand && (
                                <button
                                  onClick={(e) => toggleTitleExpansion(asset.id, e)}
                                  className="p-0.5 text-gray-400 hover:text-white transition-colors flex-shrink-0"
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
                            <p className="text-gray-400 text-xs mt-1">
                              {displayArtist}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePreviewClick(asset)}
                            className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            title="Preview Asset"
                          >
                            <FaInfoCircle size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getRiskColor(asset.risk_rating)} bg-gray-700/50`}>
                            {asset.risk_rating || 'Medium'}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-700/30 px-1.5 py-0.5 rounded-full capitalize">
                            {asset.type}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`${viewMode === 'list' ? 'grid grid-cols-2 md:grid-cols-4 gap-4 flex-1' : 'grid gap-2 mb-3 grid-cols-2'}`}>
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
                      
                      <div className={`bg-gray-700/30 p-2 rounded-md ${viewMode === 'list' ? 'md:col-span-2' : 'col-span-2'}`}>
                        <p className="text-gray-400 text-xs mb-0.5">Current ROI</p>
                        <p className={`font-medium text-sm ${getROIColor(asset.current_roi_percent)}`}>
                          {asset.current_roi_percent > 0 ? '+' : ''}{asset.current_roi_percent || 0}%
                        </p>
                      </div>

                      <div className={`bg-gray-700/30 p-2 rounded-md ${viewMode === 'list' ? 'md:col-span-2' : 'col-span-2'}`}>
                        <p className="text-gray-400 text-xs mb-0.5">Available Shares</p>
                        <p className="text-white font-medium text-sm">
                          {asset.available_shares} / {asset.total_shares}
                        </p>
                      </div>
                    </div>
                    
                    {/* Quantity Selector and Buy Button */}
                    <div className={`${viewMode === 'list' ? 'flex items-center gap-4 mt-3' : ''}`}>
                      {canBuy && (
                        <div className={`${viewMode === 'list' ? 'flex-1' : 'mb-3'}`}>
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
                        disabled={portfolioLoading || buyLoading || !canBuy || !isKYCVerified}
                        className={`${viewMode === 'list' ? 'w-32 flex-shrink-0' : 'w-full'} relative overflow-hidden font-medium py-2 rounded-lg transition-all duration-300 text-xs ${
                          clickedIndex === index 
                            ? 'bg-green-500 text-white scale-95' 
                            : !canBuy
                            ? 'bg-gray-400 cursor-not-allowed'
                            : !isKYCVerified
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <span className={`flex items-center justify-center transition-all duration-200 ${clickedIndex === index ? 'scale-110' : ''}`}>
                          {!canBuy ? (
                            "Sold Out"
                          ) : !isKYCVerified ? (
                            <>
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              Complete KYC to Invest
                            </>
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
                  </div>
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
        isKYCVerified={isKYCVerified}
        isKYCPending={isKYCPending}
        onKYCRequired={onKYCRequired}
        onDepositRequired={handleDepositRequired}
        hasSufficientFunds={hasSufficientFunds}
        availableBalance={availableBalance}
      />
    </div>
  );
}