import React, { useState } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid';
import WalletUi from './WalletUI'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CryptoPaymentModal  from "@/components/BlurModal";
import WithdrawModal  from "@/components/WithdrawModal";

const albums = [
  { 
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
    popularity: 85
  },
  { 
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
    popularity: 92
  },
  { 
    title: "Curtain Call 2", 
    artist: "Eminem", 
    cover: "https://picsum.photos/200?3", 
    price: 11.99,
    riskRating: "High",
    roiRange: "20-35%",
    assetType: "Basket",
    entryPoint: "$9.80",
    roiToDate: "+25.7%",
    genre: "Greatest Hits",
    popularity: 78
  },
  { 
    title: "The Eminem Show (Expanded)", 
    artist: "Eminem", 
    cover: "https://picsum.photos/200?4", 
    price: 13.49,
    riskRating: "Medium",
    roiRange: "12-18%",
    assetType: "Single",
    entryPoint: "$11.90",
    roiToDate: "+15.2%",
    genre: "Hip-Hop",
    popularity: 90
  },
  { 
    title: "Music To Be Murdered By", 
    artist: "Eminem", 
    cover: "https://picsum.photos/200?5", 
    price: 12.49,
    riskRating: "Low",
    roiRange: "7-10%",
    assetType: "Basket",
    entryPoint: "$11.20",
    roiToDate: "+8.9%",
    genre: "Hip-Hop",
    popularity: 82
  },
  { 
    title: "Kamikaze", 
    artist: "Eminem", 
    cover: "https://picsum.photos/200?6", 
    price: 10.99,
    riskRating: "High",
    roiRange: "25-40%",
    assetType: "Single",
    entryPoint: "$8.75",
    roiToDate: "+32.1%",
    genre: "Hip-Hop",
    popularity: 88
  },
  { 
    title: "Revival", 
    artist: "Eminem", 
    cover: "https://picsum.photos/200?7", 
    price: 9.99,
    riskRating: "Very High",
    roiRange: "30-50%",
    assetType: "Single",
    entryPoint: "$7.50",
    roiToDate: "+45.2%",
    genre: "Hip-Hop",
    popularity: 72
  },
  { 
    title: "The Marshall Mathers LP 2", 
    artist: "Eminem", 
    cover: "https://picsum.photos/200?8", 
    price: 13.99,
    riskRating: "Medium",
    roiRange: "10-15%",
    assetType: "Basket",
    entryPoint: "$12.25",
    roiToDate: "+12.8%",
    genre: "Hip-Hop",
    popularity: 87
  },
  { 
    title: "Recovery (Deluxe Edition)", 
    artist: "Eminem", 
    cover: "https://picsum.photos/200?9", 
    price: 12.99,
    riskRating: "Low",
    roiRange: "6-9%",
    assetType: "Single",
    entryPoint: "$11.80",
    roiToDate: "+7.5%",
    genre: "Hip-Hop",
    popularity: 84
  },
];

const filters = {
  genre: [
    { value: 'Hip-Hop', label: 'Hip-Hop', checked: false },
    { value: 'Greatest Hits', label: 'Greatest Hits', checked: false },
  ],
  riskRating: [
    { value: 'Very High', label: 'Very High', checked: false },
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
  assetType: [
    { value: 'Single', label: 'Single', checked: false },
    { value: 'Basket', label: 'Basket', checked: false },
  ],
};

const sortOptions = [
  { name: 'Price: Low to High', value: 'price-asc', current: false },
  { name: 'Price: High to Low', value: 'price-desc', current: false },
  { name: 'ROI: Low to High', value: 'roi-asc', current: false },
  { name: 'ROI: High to Low', value: 'roi-desc', current: true },
  { name: 'Popularity: Low to High', value: 'popularity-asc', current: false },
  { name: 'Popularity: High to Low', value: 'popularity-desc', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AlbumGrid() {
  const [clickedIndex, setClickedIndex] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('roi-desc');

  const handleBuyClick = (album, index) => {
    setClickedIndex(index);
    setTimeout(() => setClickedIndex(null), 300);
    alert(`Added to cart: ${album.title} - $${album.price}`);
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case "Very High": return "text-red-500";
      case "High": return "text-orange-500";
      case "Medium": return "text-yellow-500";
      case "Low": return "text-green-500";
      default: return "text-gray-400";
    }
  };

  const getROIColor = (roi) => {
    return roi.includes("+") ? "text-green-400" : "text-red-400";
  };

  const handleFilterChange = (filterType, value) => {
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
  };

  const getFilteredAlbums = () => {
    let filtered = [...albums];
    
    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter(album => {
        return Object.entries(activeFilters).every(([key, values]) => {
          if (key === 'roiRange') {
            const roiValue = parseFloat(album.roiToDate);
            return values.some(range => {
              if (range === '0-10') return roiValue >= 0 && roiValue <= 10;
              if (range === '10-20') return roiValue > 10 && roiValue <= 20;
              if (range === '20-30') return roiValue > 20 && roiValue <= 30;
              if (range === '30+') return roiValue > 30;
              return false;
            });
          }
          return values.includes(album[key]);
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
        filtered.sort((a, b) => parseFloat(a.roiToDate) - parseFloat(b.roiToDate));
        break;
      case 'roi-desc':
        filtered.sort((a, b) => parseFloat(b.roiToDate) - parseFloat(a.roiToDate));
        break;
      case 'popularity-asc':
        filtered.sort((a, b) => a.popularity - b.popularity);
        break;
      case 'popularity-desc':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const filteredAlbums = getFilteredAlbums();
  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div className="min-h-screen">

        < WalletUi/>
      {/* Filters */}
      <Disclosure as="section" className="border-b border-gray-700">
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
                    {filterType === 'roiRange' ? 'ROI' : filterType.replace(/([A-Z])/g, ' $1')}
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

      {/* Album Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAlbums.map((album, index) => (
            <div
              key={index}
              className="bg-[#222629] rounded-lg p-3 hover:bg-gray-750 transition-all duration-300 hover:shadow-md group border border-gray-700"
            >
              <div className="flex mb-3">
                <div className="relative overflow-hidden rounded-md flex-shrink-0">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="rounded-md w-16 h-16 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-1 right-1 bg-gray-900/90 text-white font-medium py-0.5 px-1.5 rounded text-xs">
                    ${album.price}
                  </div>
                </div>
                
                <div className="ml-3 flex-grow">
                  <h3 className="text-white font-medium text-sm truncate">{album.title}</h3>
                  <p className="text-gray-400 text-xs">{album.artist}</p>
                  
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getRiskColor(album.riskRating)} bg-gray-700/50`}>
                      {album.riskRating}
                    </span>
                    <span className="ml-1 text-xs text-gray-400 bg-gray-700/30 px-1.5 py-0.5 rounded-full">
                      {album.assetType}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-700/30 p-2 rounded-md">
                  <p className="text-gray-400 text-xs mb-0.5">ROI Range</p>
                  <p className="text-white font-medium text-sm">{album.roiRange}</p>
                </div>
                
                <div className="bg-gray-700/30 p-2 rounded-md">
                  <p className="text-gray-400 text-xs mb-0.5">Entry Point</p>
                  <p className="text-white font-medium text-sm">{album.entryPoint}</p>
                </div>
                
                <div className="bg-gray-700/30 p-2 rounded-md col-span-2">
                  <p className="text-gray-400 text-xs mb-0.5">ROI to Date</p>
                  <p className={`font-medium text-sm ${getROIColor(album.roiToDate)}`}>{album.roiToDate}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleBuyClick(album, index)}
                className={`w-full relative overflow-hidden font-medium py-2 rounded-lg transition-all duration-300 text-xs ${
                  clickedIndex === index 
                    ? 'bg-gray-300 scale-95' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <span className={`flex items-center justify-center text-gray-800 transition-all duration-200 ${clickedIndex === index ? 'scale-110' : ''}`}>
                  {clickedIndex === index ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Invest
                    </>
                  )}
                </span>
                
                <span className="absolute top-0 left-0 w-full h-full bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}