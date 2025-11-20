import React, { useState } from "react";
import { X, Music2, Layers, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface AssetPreviewModalProps {
  asset: any;
  isOpen: boolean;
  onClose: () => void;
  onInvest: (asset: any, quantity: number) => void;
  isKYCVerified: boolean;
  isKYCPending: boolean;
  onKYCRequired?: () => void;
  onDepositRequired?: () => void;
  hasSufficientFunds: boolean;
  availableBalance: number;
}

// Helper function to get image source from base64 or URL
const getImageSrc = (asset: any) => {
  if (asset?.image_base64) {
    return `data:image/jpeg;base64,${asset.image_base64}`;
  }
  if (asset?.image_url) {
    return asset.image_url;
  }
  return "https://via.placeholder.com/300";
};

export default function AssetPreviewModal({ 
  asset, 
  isOpen, 
  onClose, 
  onInvest,
  isKYCVerified,
  isKYCPending,
  onKYCRequired,
  onDepositRequired,
  hasSufficientFunds,
  availableBalance = 0
}: AssetPreviewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !asset) return null;

  const isBasket = asset.type === 'basket';

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    setQuantity(Math.max(1, Math.min(newQuantity, asset.available_shares)));
  };

  const totalCost = (asset.price * quantity).toFixed(2);
  const imageSrc = getImageSrc(asset);

  const getRiskColor = (risk: string) => {
    switch(risk?.toLowerCase()) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-400";
    }
  };

  const getROIColor = (roi: number) => {
    return roi > 0 ? "text-green-400" : "text-red-400";
  };

  const handleInvestClick = () => {
    // Check KYC requirement only
    if (!isKYCVerified && !isKYCPending) {
      toast.error(
        <div>
          <div className="font-semibold">KYC Verification Required</div>
          <div className="text-sm mt-1">
            You need to complete identity verification to make investments.
          </div>
          {onKYCRequired && (
            <button
              onClick={() => {
                onKYCRequired();
                toast.dismiss();
              }}
              className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors w-full"
            >
              Complete KYC Now
            </button>
          )}
        </div>,
        {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          style: { background: '#1f2937', color: 'white' }
        }
      );
      return;
    }

    // All checks passed, proceed with investment
    // Let backend handle balance validation
    onInvest(asset, quantity);
  };

  const getButtonState = () => {
    if (asset.available_shares === 0) {
      return {
        text: 'Sold Out',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed'
      };
    }

    if (!isKYCVerified && !isKYCPending) {
      return {
        text: 'Complete KYC to Invest',
        disabled: false,
        className: 'bg-yellow-600 hover:bg-yellow-700 text-white'
      };
    }

    return {
      text: `Invest $${totalCost}`,
      disabled: false,
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-[#1b1b1b] rounded-2xl shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X size={24} />
        </button>

        {/* Asset Header */}
        <div className="flex items-start justify-between mb-6">
         <div className="flex flex-1">
  <div className="flex-1 min-w-0">
    <h2 className="text-2xl font-bold text-white mb-1">{asset.title}</h2>

    <p className="text-gray-400 text-lg">
      {isBasket ? '🎵 Music Basket' : '🎵 Single Song'} • {asset.genre || 'Music'}
    </p>

    <div className="flex items-center gap-6 mt-2">
      <p className="text-gray-400">
        Price: <span className="text-white font-semibold text-lg">${asset.price}</span>
      </p>

      {asset.expected_roi_percent && (
        <p className="text-gray-400">
          Expected ROI:{' '}
          <span className="text-green-400 font-semibold">
            {asset.expected_roi_percent}%
          </span>
        </p>
      )}
    </div>
  </div>
</div>

          <div className="text-right flex-shrink-0">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              asset.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
            }`}>
              {asset.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Asset Details */}
          <div className="space-y-6">
            {/* Basket Details */}
            {isBasket && asset.basket && (
              <div className="p-4 bg-[#222] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white text-lg">Basket Details</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Basket Name:</p>
                    <p className="text-white font-medium">{asset.basket.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Basket Price:</p>
                    <p className="text-white font-medium">${asset.basket.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Risk Rating:</p>
                    <p className={`font-medium ${getRiskColor(asset.basket.risk_rating || '')}`}>
                      {asset.basket.risk_rating || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Expected ROI Range:</p>
                    <p className="text-white font-medium">{asset.basket.expected_roi_range || 'N/A'}</p>
                  </div>
                  {asset.basket.roi_to_date && (
                    <div>
                      <p className="text-gray-400">ROI to Date:</p>
                      <p className="text-green-400 font-medium">{asset.basket.roi_to_date}%</p>
                    </div>
                  )}
                </div>

                {/* Songs in Basket */}
                {asset.basket.songs && asset.basket.songs.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-green-400" />
                      <h5 className="font-semibold text-white">
                        Songs in Basket ({asset.basket.songs.length})
                      </h5>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {asset.basket.songs.map((song: any, index: number) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg text-sm"
                        >
                          <div className="flex items-center justify-center w-7 h-7 bg-gray-700 rounded text-xs text-gray-300 font-medium">
                            {index + 1}
                          </div>
                          {song.image_url ? (
                            <img
                              src={song.image_url}
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <Music2 className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate font-medium">{song.title}</p>
                            <p className="text-gray-400 text-xs truncate">
                              {song.artist || 'Unknown Artist'}
                            </p>
                          </div>
                          {/* {song.pivot?.weight && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-blue-400 text-xs font-medium">
                                {song.pivot.weight.toFixed(1)}%
                              </p>
                            </div>
                          )} */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Single Song Details */}
            {!isBasket && asset.song && (
              <div className="p-4 bg-[#222] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Music2 className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-white text-lg">Song Details</h4>
                </div>
                <div className="flex items-center gap-4">
                  {asset.song.image_url ? (
                    <img
                      src={asset.song.image_url}
                      alt={asset.song.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-lg truncate">{asset.song.title}</p>
                    <p className="text-gray-400 text-sm truncate">
                      {asset.song.artist || 'Unknown Artist'}
                      {asset.song.album && ` • ${asset.song.album}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Asset Information */}
            <div className="p-4 bg-[#222] rounded-xl">
              <h4 className="font-semibold text-white text-lg mb-3">Asset Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Asset Type</p>
                  <p className="text-white font-medium capitalize">{asset.type}</p>
                </div>
                <div>
                  <p className="text-gray-400">Genre</p>
                  <p className="text-white font-medium">{asset.genre || 'Various'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Shares</p>
                  <p className="text-white font-medium">{asset.total_shares.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Available Shares</p>
                  <p className="text-white font-medium">{asset.available_shares.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Investment Section */}
          <div className="space-y-6">
            {/* Investment Controls */}
            <div className="p-4 bg-[#222] rounded-xl">
              <h4 className="font-semibold text-white text-lg mb-4">Investment Details</h4>
              
              {/* Shares Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Available Shares</span>
                  <span className="text-white font-medium">
                    {asset.available_shares.toLocaleString()} / {asset.total_shares.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Invest Button */}
              <button
                onClick={handleInvestClick}
                disabled={buttonState.disabled}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${buttonState.className} ${
                  buttonState.disabled ? '' : 'hover:scale-105'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                {buttonState.text}
              </button>

              {/* Warning if no shares available */}
              {asset.available_shares === 0 && (
                <div className="mt-3 p-3 bg-yellow-600/20 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 text-sm">This asset is currently sold out</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="p-4 bg-[#222] rounded-xl">
              <h4 className="font-semibold text-white text-lg mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400">Risk Rating</p>
                  <p className={`font-semibold text-lg ${getRiskColor(asset.risk_rating)}`}>
                    {asset.risk_rating || 'Medium'}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400">Current ROI</p>
                  <p className={`font-semibold text-lg ${getROIColor(asset.current_roi_percent)}`}>
                    {asset.current_roi_percent > 0 ? '+' : ''}{asset.current_roi_percent || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}