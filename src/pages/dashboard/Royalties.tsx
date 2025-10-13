import React, { useState } from "react";
import { Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from "lucide-react";

export default function RewardPage() {
     const [showBalance, setShowBalance] = useState(false);
     const balance = "$0.00";
  return (
    <div className="min-h-screen  p-6 md:p-12 flex justify-center">
      <div className="bg-[#3b4148] rounded-3xl shadow-xl p-6 md:p-10 w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        {/* Left Section */}
        <div className="flex-1 space-y-8">
          {/* Card */}
          <div className="relative bg-[#001F54] rounded-2xl p-8 text-white min-h-[200px]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 px-6 py-2 rounded-t-xl text-sm font-medium shadow">
              1 point = $10
            </div>

             <div className="flex justify-between items-start">
                    <div>
                        <p className="text-base mb-1">Point Balance</p>
                        <p className="text-2xl tracking-widest">•••••</p>
                        <p className="text-3xl font-bold">
                        {showBalance ? balance : "********"}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-3 rounded-full border border-white/30 hover:bg-white/20"
                    >
                        {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>

            <button className="absolute bottom-6 right-6 bg-white text-black px-6 py-2 rounded-lg shadow hover:bg-gray-100">
              Merge
            </button>
          </div>

          {/* Redeem Coin */}
          <button className="w-full bg-sky-500 text-white py-4 rounded-xl font-medium text-lg hover:bg-sky-600 transition">
            Redeem Coin
          </button>

          {/* Rewards History */}
          <div>
            <h3 className="font-semibold text-white text-lg">Rewards History</h3>
           <div className="flex flex-col justify-center items-center text-gray-400 mt-8 space-y-6">
                    <img
                        src="https://testapp.artsplit.com/images/empty.svg"
                        alt="No history"
                        className="w-48 h-48" // Increased size from w-32 h-32 to w-48 h-48
                    />
                    <p className="font-medium text-gray-700 text-xl">No history yet</p>
                    <span className="text-base text-center max-w-md">
                        Continue to engage and reap the rewards.
                    </span>
                    </div>

          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-96 space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-white">How to Earn Rewards</h3>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Unlock exciting rewards by exploring our easy-to-follow guide!
              Discover the various ways you can earn points, bonuses, and exclusive offers
              that enhance your experience. Let’s dive in and start earning!
            </p>
          </div>

          {/* Reward Steps */}
          <div className="space-y-4">
            {[
              { color: "bg-blue-500", icon: "👥", title: "Referrals", desc: "Refer friends with full KYC and earn coins" },
              { color: "bg-orange-500", icon: "🔒", title: "Verification", desc: "Complete your KYC and earn coins" },
              { color: "bg-green-500", icon: "💰", title: "Fund Wallet", desc: "Fund your wallet and earn coins" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                <div className={`w-10 h-10 ${item.color} rounded-full flex justify-center items-center text-white text-lg`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
