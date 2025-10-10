import React, { useState, useEffect } from "react";
import { X, Copy, CheckCircle2 } from "lucide-react";
import QRCode from "react-qr-code";

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, network: string, proof: string) => void;
  onGetWalletAddress: (network: string) => void;
  walletAddress: any;
}

export default function CryptoPaymentModal({ 
  isOpen, 
  onClose, 
  onDeposit, 
  onGetWalletAddress,
  walletAddress 
}: CryptoPaymentModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [proofBase64, setProofBase64] = useState<string>("");
  const [copied, setCopied] = useState(false);

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
      setNetwork("");
      setFile(null);
      setProofBase64("");
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (network && step === 2) {
      onGetWalletAddress(network);
    }
  }, [network, step, onGetWalletAddress]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const base64 = await convertToBase64(selectedFile);
        setProofBase64(base64);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        alert('Failed to process image. Please try another file.');
      }
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress?.wallet_address) {
      navigator.clipboard.writeText(walletAddress.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitPayment = () => {
    if (!amount || !network || !proofBase64) {
      alert("Please fill all required fields and upload payment proof.");
      return;
    }
    
    onDeposit(
      parseFloat(amount),
      network,
      proofBase64
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Crypto Deposit</h2>

        {step === 1 && (
          <div>
            <label className="block mb-4">
              <span className="text-gray-700 font-medium">Enter Amount (USD)</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in USD"
                min="0.01"
                step="0.01"
                className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700 font-medium">Select Network</span>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="mt-2 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Network --</option>
                {networks.map(net => (
                  <option key={net.value} value={net.value}>
                    {net.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={() => {
                if (!amount || parseFloat(amount) <= 0) {
                  alert("Please enter a valid amount.");
                  return;
                }
                if (!network) {
                  alert("Please select a network.");
                  return;
                }
                setStep(2);
              }}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Amount:</span>
                <span className="font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Network:</span>
                <span className="font-semibold capitalize">{network}</span>
              </div>
            </div>

            {walletAddress ? (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg shadow border mb-4">
                  {walletAddress.qr_code ? (
                    <img 
                      src={walletAddress.qr_code} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <QRCode 
                      value={walletAddress.wallet_address} 
                      size={192}
                      className="mx-auto"
                    />
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">Send exactly ${amount} worth of {network} to:</p>
                  <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                    <p className="font-mono text-sm text-gray-800 break-all mr-2">
                      {walletAddress.wallet_address}
                    </p>
                    <button
                      onClick={handleCopyAddress}
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700"
                    >
                      {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-green-500 text-sm mt-2">Address copied to clipboard!</p>
                  )}
                </div>

                <div className="text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium">⚠️ Important</p>
                  <p className="text-xs mt-1">
                    • Send only {network.toUpperCase()} to this address<br/>
                    • Network fees may apply<br/>
                    • Transaction may take several minutes to confirm
                  </p>
                </div>

                <div className="mt-6">
                  <label className="block mb-3 text-gray-700 font-medium text-left">
                    Upload Payment Proof (Screenshot/Transaction Hash)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border rounded-xl p-3"
                    accept="image/*,.pdf"
                    required
                  />
                  {file && (
                    <p className="text-green-500 text-sm mt-2 text-left">
                      ✓ {file.name} selected
                    </p>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleSubmitPayment}
                    disabled={!proofBase64}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Deposit
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading wallet address...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}