import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import QRCode from "react-qr-code";

export default function CryptoPaymentModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [file, setFile] = useState(null);

  const walletAddresses = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
    USDT: "TQ2J8KsxWLh8LZHpEwq3kHXZk1Ghq9j5kP",
  };

  // ✅ Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAmount("");
      setNetwork("");
      setFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full mx-4">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Crypto Payment
        </h2>

        {/* Step 1: Enter Amount */}
        {step === 1 && (
          <div>
            <label className="block mb-4">
              <span className="text-gray-700 font-medium">Enter Amount</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in USD"
                className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <button
              onClick={() => {
                if (!amount || amount <= 0) {
                  alert("Please enter a valid amount.");
                  return;
                }
                setStep(2);
              }}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Select Network + QR */}
        {step === 2 && (
          <>
            <p className="text-sm text-gray-500 mb-2">
              Amount: <span className="font-semibold">${amount}</span>
            </p>

            <label className="block mb-4">
              <span className="text-gray-700 font-medium">Select Network</span>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose --</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
            </label>

            {network && (
              <div className="mt-6 text-center flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow">
                  <QRCode value={walletAddresses[network]} size={160} />
                </div>
                <p className="mt-4 font-mono text-gray-700 text-sm break-words">
                  {walletAddresses[network]}
                </p>
                <p className="mt-2 text-gray-500 text-sm">
                  Scan the QR code or copy the wallet address to make your
                  payment.
                </p>
              </div>
            )}

            {network && (
              <div className="mt-6">
                <label className="block mb-2 text-gray-700 font-medium">
                  Upload Payment Proof
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full border rounded-xl p-2"
                />
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition"
              >
                Back
              </button>

              {network && (
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
                >
                  I have made payment
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center flex flex-col items-center">
            <CheckCircle2 className="text-green-500" size={80} />
            <h3 className="text-xl font-bold text-gray-800 mt-4">
              Payment Submitted!
            </h3>
            <p className="text-gray-600 mt-2">
              Your payment is now under review.  
              You will be notified once it is confirmed.
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
