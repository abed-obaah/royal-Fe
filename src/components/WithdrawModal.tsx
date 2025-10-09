import React, { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, method: string, details?: any) => void;
  availableBalance: number;
}

export default function WithdrawModal({ isOpen, onClose, onWithdraw, availableBalance }: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [network, setNetwork] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAmount("");
      setMethod("");
      setNetwork("");
      setWalletAddress("");
    }
  }, [isOpen]);

  const handleSubmitWithdrawal = () => {
    if (!amount || !method) return;
    
    const withdrawalDetails = {
      network: method === 'Crypto' ? network : undefined,
      walletAddress: method === 'Crypto' ? walletAddress : undefined,
    };

    onWithdraw(
      parseFloat(amount),
      method,
      withdrawalDetails
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
                min="0"
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
              <label className="text-sm font-medium text-gray-700">Choose Method</label>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Crypto", "Bank Transfer"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setMethod(opt)}
                    className={`rounded-xl border p-3 text-sm font-medium transition
                      ${method === opt ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance || !method}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Amount: <span className="font-semibold text-gray-900">${amount}</span></span>
              <span>Method: <span className="font-semibold text-gray-900">{method}</span></span>
            </div>

            {method === "Crypto" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Crypto Network</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDT">Tether (USDT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Your Wallet Address</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Paste your wallet address"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            {method === "Bank Transfer" && (
              <div className="text-center text-gray-500 py-4">
                <p>Bank transfer details will be requested during processing.</p>
                <p className="text-sm mt-2">Our team will contact you for bank details.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmitWithdrawal}
                disabled={method === 'Crypto' && (!network || !walletAddress)}
                className="flex-1 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}