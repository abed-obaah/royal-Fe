import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, method: 'crypto' | 'bank', details: any) => void;
  availableBalance: number;
}

export default function WithdrawModal({ isOpen, onClose, onWithdraw, availableBalance }: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<'crypto' | 'bank'>('crypto');
  const [network, setNetwork] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");

  const networks = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)' },
    { value: 'ethereum', label: 'Ethereum (ETH)' },
    { value: 'solana', label: 'Solana (SOL)' },
    { value: 'tether', label: 'Tether (USDT)' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAmount("");
      setMethod('crypto');
      setNetwork("");
      setWalletAddress("");
      setAccountNumber("");
      setBankName("");
      setAccountName("");
    }
  }, [isOpen]);

  const handleSubmitWithdrawal = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      alert("Insufficient balance.");
      return;
    }

    let details: any = {};

    if (method === 'crypto') {
      if (!network || !walletAddress) {
        alert("Please fill all required fields for crypto withdrawal.");
        return;
      }
      details = {
        wallet_address: walletAddress,
        network: network
      };
    } else {
      if (!accountNumber || !bankName || !accountName) {
        alert("Please fill all required fields for bank withdrawal.");
        return;
      }
      details = {
        account_number: accountNumber,
        bank_name: bankName,
        account_name: accountName
      };
    }

    onWithdraw(
      parseFloat(amount),
      method,
      details
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg mx-4 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Withdraw Funds</h2>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Amount (USD)</label>
              <input
                type="number"
                min="0.01"
                max={availableBalance}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max: $${availableBalance.toFixed(2)}`}
                className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: ${availableBalance.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Withdrawal Method</label>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('crypto')}
                  className={`rounded-xl border p-3 text-sm font-medium transition
                    ${method === 'crypto' ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
                >
                  Crypto
                </button>
                <button
                  onClick={() => setMethod('bank')}
                  className={`rounded-xl border p-3 text-sm font-medium transition
                    ${method === 'bank' ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            <button
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">${amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold text-gray-900 capitalize">{method}</span>
              </div>
            </div>

            {method === "crypto" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Crypto Network *</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">-- Select Network --</option>
                    {networks.map(net => (
                      <option key={net.value} value={net.value}>
                        {net.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Your Wallet Address *</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Paste your wallet address"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Make sure this address supports the selected network
                  </p>
                </div>
              </>
            )}

            {method === "bank" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Account Number *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Account Name *</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Enter account holder name"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                ⚠️ Withdrawal processing time: 1-3 business days. You will receive email confirmation.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmitWithdrawal}
                disabled={
                  method === 'crypto' 
                    ? !network || !walletAddress
                    : !bankName || !accountNumber || !accountName
                }
                className="flex-1 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700"
              >
                Submit Withdrawal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}