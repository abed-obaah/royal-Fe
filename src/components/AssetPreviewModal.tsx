import React, { useState } from "react";
import { X } from "lucide-react";
import { FaPlus, FaMinus } from 'react-icons/fa';

interface AssetPreviewModalProps {
  asset: any;
  isOpen: boolean;
  onClose: () => void;
  onInvest: (asset: any, quantity: number) => void;
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

export default function AssetPreviewModal({ asset, isOpen, onClose, onInvest }: AssetPreviewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !asset) return null;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    setQuantity(Math.max(1, Math.min(newQuantity, asset.available_shares)));
  };

  const totalCost = (asset.price * quantity).toFixed(2);
  const imageSrc = getImageSrc(asset);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-[#222629] rounded-2xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={imageError ? "https://via.placeholder.com/300" : imageSrc}
              alt={asset.title}
              className="rounded-lg w-48 h-48 object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-white mb-2">{asset.title}</h2>
            <p className="text-gray-400 text-lg mb-4">{asset.artist || 'Various Artists'}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Price</p>
                <p className="text-white font-semibold text-xl">${asset.price}</p>
              </div>
              
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Risk Rating</p>
                <p className={`font-semibold text-xl ${getRiskColor(asset.risk_rating)}`}>
                  {asset.risk_rating || 'Medium'}
                </p>
              </div>
              
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Expected ROI</p>
                <p className="text-white font-semibold text-xl">{asset.expected_roi_range || '10-20%'}</p>
              </div>
              
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Current ROI</p>
                <p className={`font-semibold text-xl ${getROIColor(asset.current_roi_percent)}`}>
                  {asset.current_roi_percent > 0 ? '+' : ''}{asset.current_roi_percent || 0}%
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Asset Type</p>
                <p className="text-white font-medium capitalize">{asset.type}</p>
              </div>
              
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Genre</p>
                <p className="text-white font-medium">{asset.genre || 'Various'}</p>
              </div>
              
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Available Shares</p>
                <p className="text-white font-medium">{asset.available_shares} / {asset.total_shares}</p>
              </div>
              
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Entry Point</p>
                <p className="text-white font-medium">${asset.price}</p>
              </div>
            </div>

            {asset.song && (
              <div className="bg-gray-700/30 p-3 rounded-lg mb-6">
                <p className="text-gray-400 text-sm mb-2">Song Details</p>
                <p className="text-white text-sm">
                  {asset.song.title} • {asset.song.duration_ms ? `${Math.floor(asset.song.duration_ms / 60000)}:${((asset.song.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}` : 'N/A'}
                </p>
              </div>
            )}

            {asset.basket && asset.basket.songs && (
              <div className="bg-gray-700/30 p-3 rounded-lg mb-6">
                <p className="text-gray-400 text-sm mb-2">Basket Contents</p>
                <p className="text-white text-sm">
                  {asset.basket.songs.length} songs included
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm">Select Quantity</p>
                <p className="text-white font-semibold">Total: ${totalCost}</p>
              </div>
              <div className="flex items-center justify-between bg-gray-700/30 rounded-lg p-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-gray-600/50"
                >
                  <FaMinus size={16} />
                </button>
                <span className="text-white font-bold text-xl mx-4">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= asset.available_shares}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-gray-600/50"
                >
                  <FaPlus size={16} />
                </button>
              </div>
            </div>
            
            <button
              onClick={() => onInvest(asset, quantity)}
              disabled={asset.available_shares === 0}
              className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
                asset.available_shares === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {asset.available_shares === 0 ? 'Sold Out' : `Invest $${totalCost}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}