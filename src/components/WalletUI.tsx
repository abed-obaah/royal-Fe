import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from "lucide-react";
import CryptoPaymentModal from "./CryptoPaymentModal";
import WithdrawModal from "@/components/WithdrawModal";
import TransactionHistoryModal from "./TransactionHistoryModal";
import { getWallet } from "@/api/wallet";
import { 
  createTransaction, 
  fetchUserTransactions,
  getWalletAddress 
} from "../slices/transactionSlice";
import { RootState, AppDispatch } from "../store";

interface WalletData {
  id: number;
  currency: string;
  available_balance: string;
  invested_balance: string;
  total_balance: string;
  formatted: {
    available: string;
    invested: string;
    total: string;
  };
  recent_transactions: any[];
  created_at: string;
  updated_at: string;
}

interface WalletApiResponse {
  wallet: WalletData;
}

export default function WalletUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { userTransactions, loading: transactionsLoading, walletAddress } = useSelector((state: RootState) => state.transactions);
  
  const [showBalance, setShowBalance] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const data: WalletApiResponse = await getWallet();
        setWallet(data.wallet);
        
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

  const handleDeposit = async (amount: number, network: string, proof: string) => {
    try {
      await dispatch(createTransaction({
        kind: 'deposit',
        amount,
        network,
        proof_url: proof,
      })).unwrap();
      
      // Refresh wallet data and transactions
      const data: WalletApiResponse = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
      
      setIsDepositModalOpen(false);
    } catch (error: any) {
      console.error('Deposit failed:', error);
      alert(error || 'Deposit failed. Please try again.');
    }
  };

  const handleWithdraw = async (amount: number, method: 'crypto' | 'bank', details: any) => {
    try {
      const transactionData: any = {
        kind: 'withdraw',
        amount,
        method,
        withdrawal_details: details,
      };

      if (method === 'crypto') {
        transactionData.network = details.network;
      }

      await dispatch(createTransaction(transactionData)).unwrap();
      
      // Refresh wallet data and transactions
      const data: WalletApiResponse = await getWallet();
      setWallet(data.wallet);
      await dispatch(fetchUserTransactions());
      
      setIsWithdrawModalOpen(false);
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      alert(error || 'Withdrawal failed. Please try again.');
    }
  };

  const handleGetWalletAddress = async (network: string) => {
    try {
      await dispatch(getWalletAddress(network)).unwrap();
    } catch (error: any) {
      console.error('Failed to get wallet address:', error);
      alert(error || 'Failed to get wallet address. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6 text-white">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-500">Failed to load wallet. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const available = parseFloat(wallet.available_balance);
  const invested = parseFloat(wallet.invested_balance);
  const totalBalance = parseFloat(wallet.total_balance);
  const currency = wallet.currency || "USD";

  return (
    <div className="p-6">
      {/* Wallet Section */}
      <div className="bg-[#222629] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between">
        <div className="flex flex-col space-y-6">
          <div>
            <select className="border rounded-lg px-3 py-1 text-gray-600 bg-white">
              <option>{currency}</option>
            </select>
          </div>

          {/* Balance + toggle */}
          <div className="flex items-center space-x-3">
            <div className="text-4xl font-bold text-white">
              {showBalance ? `${currency} ${totalBalance.toFixed(2)}` : "••••••"}
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-blue-400 text-sm">Total Balance</div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-colors"
            >
              <ArrowDownCircle size={20} />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={available <= 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-colors ${
                available <= 0 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-900'
              }`}
              title={available <= 0 ? 'Insufficient balance' : 'Withdraw funds'}
            >
              <ArrowUpCircle size={20} />
              <span>Withdraw</span>
            </button>
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-blue-900 px-6 py-3 rounded-2xl transition-colors"
            >
              <RefreshCcw size={20} />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Balances */}
        <div className="flex flex-col space-y-4 mt-6 md:mt-0 md:w-1/3">
          <div className="border border-orange-200 rounded-xl p-4 flex justify-between items-center bg-orange-50">
            <div className="w-full">
              <p className="text-gray-600 text-sm mb-1">Invested</p>
              <p className="text-2xl font-semibold text-gray-800">
                {showBalance ? `${currency} ${invested.toFixed(2)}` : "••••••"}
              </p>
              <span className="text-xs text-gray-500">
                {showBalance ? wallet.formatted.invested : "Hidden"}
              </span>
            </div>
          </div>

          <div className="border border-green-200 rounded-xl p-4 flex justify-between items-center bg-green-50">
            <div className="w-full">
              <p className="text-gray-600 text-sm mb-1">Available</p>
              <p className="text-2xl font-semibold text-gray-800">
                {showBalance ? `${currency} ${available.toFixed(2)}` : "••••••"}
              </p>
              <span className="text-xs text-gray-500">
                {showBalance ? wallet.formatted.available : "Hidden"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {userTransactions && userTransactions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Total Transactions</div>
            <div className="text-white text-xl font-bold">{userTransactions.length}</div>
          </div>
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Pending</div>
            <div className="text-yellow-400 text-xl font-bold">
              {userTransactions.filter(t => t.status === 'pending').length}
            </div>
          </div>
          <div className="bg-[#222629] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Completed</div>
            <div className="text-green-400 text-xl font-bold">
              {userTransactions.filter(t => t.status === 'completed').length}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Preview */}
      {userTransactions && userTransactions.length > 0 && (
        <div className="mt-6 bg-[#222629] p-6 rounded-2xl">
          <h3 className="text-white text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {userTransactions.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-[#2a2e32] rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.status === 'completed' ? 'bg-green-500' : 
                    tx.status === 'pending' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-white font-medium capitalize">{tx.kind}</p>
                    <p className="text-gray-400 text-xs">{tx.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.kind === 'deposit' ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {tx.kind === 'deposit' ? '+' : '-'}{currency} {parseFloat(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CryptoPaymentModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={handleDeposit}
        onGetWalletAddress={handleGetWalletAddress}
        walletAddress={walletAddress}
      />
      
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onWithdraw={handleWithdraw}
        availableBalance={available}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactions={userTransactions}
        loading={transactionsLoading}
      />
    </div>
  );
}