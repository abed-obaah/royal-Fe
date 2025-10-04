import React, { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from "lucide-react";
import CryptoPaymentModal from "@/components/BlurModal";
import WithdrawModal from "@/components/WithdrawModal";
import { getWallet } from "@/api/wallet";

interface WalletApiResponse {
  id: number;
  user_id: number;
  available_balance: string;
  invested_balance: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export default function WalletUI() {
  const [showBalance, setShowBalance] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [wallets, setWallets] = useState<WalletApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const data = await getWallet();
        setWallets(data || []);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Assume first wallet (or adapt if multiple currencies exist)
  const wallet = wallets[0];

  const available = parseFloat(wallet?.available_balance || "0");
  const invested = parseFloat(wallet?.invested_balance || "0");
  const totalBalance = available + invested;
  const currency = wallet?.currency || "USD";

  return (
    <div className="p-6">
      {/* Wallet Section */}
      <div className="bg-[#222629] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between">
        <div className="flex flex-col space-y-6">
          <div>
            <select className="border rounded-lg px-3 py-1 text-gray-600">
              <option>{currency}</option>
            </select>
          </div>

          {/* Balance + toggle */}
          <div className="flex items-center space-x-3">
            <div className="text-4xl font-bold text-white">
              {showBalance ? `${currency} ${totalBalance.toFixed(2)}` : "••••"}
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-600 flex items-center space-x-2"
            >
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="text-blue-700 text-sm text-left">Total Balance</button>

          {/* Buttons */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-900 text-white px-6 py-3 rounded-2xl"
            >
              <ArrowDownCircle size={20} />
              <span>Add</span>
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex items-center space-x-2 bg-gray-100 text-blue-900 px-6 py-3 rounded-2xl"
            >
              <ArrowUpCircle size={20} />
              <span>Withdraw</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-100 text-blue-900 px-6 py-3 rounded-2xl">
              <RefreshCcw size={20} />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Balances */}
        <div className="flex flex-col space-y-4 mt-6 md:mt-0 md:w-1/3">
          <div className="border rounded-xl p-4 flex justify-between items-center bg-orange-50">
            <div>
              <p className="text-gray-500">Invested</p>
              <p className="text-2xl font-semibold">
                {showBalance ? `${currency} ${invested.toFixed(2)}` : "••••"}
              </p>
              <span className="text-xs text-gray-400">≈ {invested}</span>
            </div>
          </div>

          <div className="border rounded-xl p-4 flex justify-between items-center bg-green-50">
            <div>
              <p className="text-gray-500">Available</p>
              <p className="text-2xl font-semibold">
                {showBalance ? `${currency} ${available.toFixed(2)}` : "••••"}
              </p>
              <span className="text-xs text-gray-400">≈ {available}</span>
            </div>
          </div>
        </div>
      </div>

      <CryptoPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </div>
  );
}
