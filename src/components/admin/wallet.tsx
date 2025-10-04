import React, { useState } from "react";
import { Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, RefreshCcw, GiftIcon,Wallet2Icon,ShoppingBasketIcon,BackpackIcon } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CryptoPaymentModal  from "@/components/BlurModal";
import WithdrawModal  from "@/components/WithdrawModal";


export default function WalletUI() {
  const [showBalance, setShowBalance] = React.useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
      const [isWithdrawOpen, setWithdrawOpen] = useState(false);
//  <Link to="/">Home</Link>
  return (
    <div className="p-6">
      {/* Top Navigation */}
      <div className="flex space-x-10 text-gray-500 font-medium text-sm mb-6">
        <button className="flex items-center space-x-1 border-b-2 border-blue-600 text-blue-600">
          <Wallet2Icon aria-hidden="true" className="size-5" />
          <span>Wallet</span>
        </button>
      </div>
      {/* Wallet Section */}
      <div className="bg-[#222629] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between">
        <div className="flex flex-col space-y-6">
          <div>
           <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20">
                Active
            </span>
          </div>

          {/* Balance and toggle side by side */}
          <div className="flex items-center space-x-3">
            <div className="text-4xl font-bold text-white">{showBalance ? "$0" : "••••"}</div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-600 flex items-center space-x-2"
            >
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      <CryptoPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setWithdrawOpen(false)} />
      </div>
    </div>
  );
}
