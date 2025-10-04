import React, { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

export default function WithdrawModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");

  // Crypto-only fields
  const [network, setNetwork] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  // Optional: placeholders if you later want PayPal/Bank
  const [paypalEmail, setPaypalEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Reset everything whenever modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAmount("");
      setMethod("");
      setNote("");
      setNetwork("");
      setWalletAddress("");
      setPaypalEmail("");
      setBankName("");
      setAccountNumber("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  // Validation
  const canContinueStep1 = Number(amount) > 0 && method;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const canSubmitStep2 =
    method === "Crypto"
      ? network && walletAddress.trim().length > 0
      : method === "PayPal"
      ? emailRegex.test(paypalEmail)
      : method === "Bank"
      ? bankName.trim() && accountNumber.trim()
      : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg mx-4 p-6">
        {/* Close Icon */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Withdraw Funds
        </h2>

        {/* STEP 1 — Amount + Method */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 250.00"
                className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the amount you want to withdraw.
              </p>
            </div>

            {/* Method */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Choose Method
              </label>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Crypto", "PayPal", "Bank"].map((opt) => {
                  const active = method === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMethod(opt)}
                      className={`rounded-xl border p-3 text-sm font-medium transition
                        ${active ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-semibold transition
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 — Method details + Note + Submit */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Amount: <span className="font-semibold text-gray-900">${amount}</span>
              </span>
              <span>
                Method: <span className="font-semibold text-gray-900">{method}</span>
              </span>
            </div>

            {/* Method-specific fields */}
            {method === "Crypto" && (
              <>
                {/* Network */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Crypto Network
                  </label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDT-TRC20">Tether (USDT-TRC20)</option>
                    <option value="USDT-ERC20">Tether (USDT-ERC20)</option>
                  </select>
                </div>

                {/* Wallet address */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Your Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Paste the wallet address to receive funds"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Double-check this address. Withdrawals sent to a wrong address can’t be reversed.
                  </p>
                </div>
              </>
            )}

            {method === "PayPal" && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  PayPal Email
                </label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {method === "Bank" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. First National Bank"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            {/* Optional note */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a short note for the team…"
                className="mt-2 w-full min-h-24 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canSubmitStep2}
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl font-semibold transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-green-600 text-white hover:bg-green-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Success */}
        {step === 3 && (
          <div className="text-center flex flex-col items-center">
            <CheckCircle2 className="text-green-500" size={80} />
            <h3 className="text-xl font-bold text-gray-900 mt-4">
              Withdrawal submitted for review!
            </h3>
            <p className="text-gray-600 mt-2">
              We’ll notify you once your withdrawal is processed.
            </p>

            <div className="mt-4 w-full rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Amount</span>
                <span className="font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Method</span>
                <span className="font-semibold">{method}</span>
              </div>
              {method === "Crypto" && (
                <>
                  <div className="flex justify-between mt-1">
                    <span>Network</span>
                    <span className="font-semibold">{network}</span>
                  </div>
                  <div className="mt-1">
                    <span className="block">Wallet Address</span>
                    <span className="font-mono text-xs break-all text-gray-600">
                      {walletAddress}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
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
