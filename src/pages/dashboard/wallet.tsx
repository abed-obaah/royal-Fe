import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from "lucide-react";
import CryptoPaymentModal from "@/components/BlurModal";
import WithdrawModal from "@/components/WithdrawModal";
import { getWallet } from "@/api/wallet";
import { createTransaction, fetchUserTransactions } from "../../slices/transactionSlice";
import { RootState, AppDispatch } from "../../store";

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
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading: transactionsLoading } = useSelector((state: RootState) => state.transactions);
  
  const [showBalance, setShowBalance] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [wallets, setWallets] = useState<WalletApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const data = await getWallet();
        setWallets(data || []);
        
        // Fetch transaction history
        await dispatch(fetchUserTransactions());
      } catch (err) {
        console.error("Failed to fetch wallet data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [dispatch]);

  const handleDeposit = async (amount: number, method: string, proof?: string) => {
    try {
      await dispatch(createTransaction({
        kind: 'deposit',
        type: 'credit',
        amount,
        method,
        proof_url: proof,
      })).unwrap();
      
      // Refresh wallet data and transactions
      const data = await getWallet();
      setWallets(data || []);
      await dispatch(fetchUserTransactions());
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed. Please try again.');
    }
  };

  const handleWithdraw = async (amount: number, method: string, details?: any) => {
    try {
      await dispatch(createTransaction({
        kind: 'withdraw',
        type: 'debit',
        amount,
        method,
        meta: details,
      })).unwrap();
      
      // Refresh wallet data and transactions
      const data = await getWallet();
      setWallets(data || []);
      await dispatch(fetchUserTransactions());
      
      setWithdrawOpen(false);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed. Please try again.');
    }
  };

  const handleShowHistory = () => {
    console.log('Transaction history:', transactions);
    alert(`You have ${transactions.length} transactions. Check console for details.`);
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

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
              className="text-gray-400 hover:text-white"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-blue-400 text-sm">Total Balance</div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-colors"
            >
              <ArrowDownCircle size={20} />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              disabled={available <= 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-colors ${
                available <= 0 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-900'
              }`}
            >
              <ArrowUpCircle size={20} />
              <span>Withdraw</span>
            </button>
            <button 
              onClick={handleShowHistory}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-blue-900 px-6 py-3 rounded-2xl transition-colors"
            >
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

      {/* Quick Stats */}
      {transactions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Total Transactions</div>
            <div className="text-white text-xl font-bold">{transactions.length}</div>
          </div>
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Pending</div>
            <div className="text-yellow-400 text-xl font-bold">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
          </div>
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Completed</div>
            <div className="text-green-400 text-xl font-bold">
              {transactions.filter(t => t.status === 'completed').length}
            </div>
          </div>
        </div>
      )}

      <CryptoPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeposit={handleDeposit}
      />
      
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
        availableBalance={available}
      />
    </div>
  );
}