import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  RefreshCcw,
  Eye,
  X,
  QrCode
} from 'lucide-react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  fetchNetworkWallets,
  createNetworkWallet,
  updateNetworkWallet,
  deleteNetworkWallet,
  clearError,
  clearCurrentWallet,
  setCurrentWallet
} from '../../slices/networkWalletSlice';
import { RootState, AppDispatch } from '../../store';

interface NetworkWalletForm {
  network: string;
  wallet_address: string;
  qr_code: string;
  notes: string;
  is_active: boolean;
}

export default function WalletAddress() {
  const dispatch = useDispatch<AppDispatch>();
  const { wallets, loading, error, currentWallet } = useSelector((state: RootState) => state.networkWallets);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<any>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  const [formData, setFormData] = useState<NetworkWalletForm>({
    network: '',
    wallet_address: '',
    qr_code: '',
    notes: '',
    is_active: true
  });

  const networks = [
    'bitcoin', 'ethereum', 'solana', 'tether', 'binance', 
    'cardano', 'polkadot', 'ripple', 'litecoin', 'chainlink'
  ];

  useEffect(() => {
    dispatch(fetchNetworkWallets());
  }, [dispatch]);

  useEffect(() => {
    if (currentWallet && isEditModalOpen) {
      setFormData({
        network: currentWallet.network,
        wallet_address: currentWallet.wallet_address,
        qr_code: currentWallet.qr_code || '',
        notes: currentWallet.notes || '',
        is_active: currentWallet.is_active
      });
    }
  }, [currentWallet, isEditModalOpen]);

  // Function to generate QR code using external API
  const generateQRCode = async (walletAddress: string, network: string): Promise<string> => {
    try {
      setGeneratingQR(true);
      
      // Using QR Code Generator API (free tier)
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/`;
      const params = new URLSearchParams({
        size: '200x200',
        data: walletAddress,
        format: 'png'
      });

      const response = await fetch(`${apiUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      // Convert the image to base64
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      
      // Fallback: Generate QR code using Google Charts API
      try {
        const googleQRUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(walletAddress)}&choe=UTF-8`;
        const response = await fetch(googleQRUrl);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (fallbackError) {
        console.error('Fallback QR generation failed:', fallbackError);
        throw new Error('Failed to generate QR code');
      }
    } finally {
      setGeneratingQR(false);
    }
  };

  // Auto-generate QR code when wallet address changes in create mode
  useEffect(() => {
    const generateQRForNewWallet = async () => {
      if (isCreateModalOpen && formData.wallet_address && formData.network && !formData.qr_code) {
        try {
          const qrCode = await generateQRCode(formData.wallet_address, formData.network);
          setFormData(prev => ({ ...prev, qr_code: qrCode }));
        } catch (error) {
          console.error('Failed to generate QR code:', error);
          // Don't set QR code if generation fails
        }
      }
    };

    generateQRForNewWallet();
  }, [formData.wallet_address, formData.network, isCreateModalOpen]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreate = () => {
    setFormData({
      network: '',
      wallet_address: '',
      qr_code: '',
      notes: '',
      is_active: true
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (wallet: any) => {
    dispatch(setCurrentWallet(wallet));
    setIsEditModalOpen(true);
  };

  const handleView = (wallet: any) => {
    dispatch(setCurrentWallet(wallet));
    setIsViewModalOpen(true);
  };

  const handleDelete = (wallet: any) => {
    setWalletToDelete(wallet);
    setIsDeleteModalOpen(true);
  };

  // Manual QR code generation function
  const handleGenerateQRCode = async () => {
    if (!formData.wallet_address || !formData.network) {
      alert('Please enter both network and wallet address first');
      return;
    }

    try {
      const qrCode = await generateQRCode(formData.wallet_address, formData.network);
      setFormData(prev => ({ ...prev, qr_code: qrCode }));
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createNetworkWallet(formData)).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        network: '',
        wallet_address: '',
        qr_code: '',
        notes: '',
        is_active: true
      });
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWallet) return;
    
    try {
      await dispatch(updateNetworkWallet({
        id: currentWallet.id,
        walletData: formData
      })).unwrap();
      setIsEditModalOpen(false);
      dispatch(clearCurrentWallet());
    } catch (error) {
      console.error('Failed to update wallet:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!walletToDelete) return;
    
    try {
      await dispatch(deleteNetworkWallet(walletToDelete.id)).unwrap();
      setIsDeleteModalOpen(false);
      setWalletToDelete(null);
    } catch (error) {
      console.error('Failed to delete wallet:', error);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchNetworkWallets());
  };

  const clearErrors = () => {
    dispatch(clearError());
  };

  const formatNetwork = (network: string) => {
    return network.charAt(0).toUpperCase() + network.slice(1);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? "bg-green-600 text-green-100"
      : "bg-red-600 text-red-100";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  return (
    <div className="">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Network Wallets</h1>
          <p className="text-gray-400 text-sm mt-1">Manage cryptocurrency wallet addresses for deposits</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Add Wallet</span>
          </button>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500 rounded-lg p-4 flex justify-between items-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={clearErrors}
            className="text-red-500 hover:text-red-400 ml-4"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6 space-y-6">
        <div className="bg-[#222629] rounded-2xl shadow p-6 min-h-screen">
          {loading && wallets.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <span className="ml-3 text-gray-400">Loading wallets...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="bg-[#1b1d1f] border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{formatNetwork(wallet.network)}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(wallet.is_active)}`}>
                        {getStatusText(wallet.is_active)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleView(wallet)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(wallet)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Edit Wallet"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(wallet)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Wallet"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Wallet Address</label>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-300 font-mono truncate">
                          {wallet.wallet_address}
                        </p>
                        <button 
                          onClick={() => handleCopy(wallet.wallet_address, `address-${wallet.id}`)}
                          className="text-gray-400 hover:text-white ml-2 flex-shrink-0"
                        >
                          {copiedField === `address-${wallet.id}` ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    {wallet.qr_code && (
                      <div className="mt-4">
                        <label className="text-sm text-gray-400">QR Code</label>
                        <div className="mt-2 bg-white p-2 rounded-lg inline-block">
                          <img 
                            src={wallet.qr_code} 
                            alt={`${wallet.network} QR Code`}
                            className="w-24 h-24"
                          />
                        </div>
                      </div>
                    )}

                    {wallet.notes && (
                      <div>
                        <label className="text-sm text-gray-400">Notes</label>
                        <p className="text-sm text-gray-300 mt-1">{wallet.notes}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-4">
                      Updated: {new Date(wallet.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {wallets.length === 0 && !loading && (
            <div className="flex flex-col justify-center items-center text-gray-400 space-y-4 mt-10">
              <div className="text-6xl">👛</div>
              <h3 className="text-xl font-semibold">No Wallet Addresses</h3>
              <p className="text-gray-500 text-center max-w-md">
                You haven't added any wallet addresses yet. Add your first wallet address to start accepting cryptocurrency deposits.
              </p>
              <button 
                onClick={handleCreate}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors mt-4"
              >
                <Plus size={18} />
                <span>Add Your First Wallet</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1f2225] rounded-3xl shadow-2xl p-6 w-full max-w-md transform transition-transform duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {isCreateModalOpen ? 'Add New Wallet' : 'Edit Wallet'}
              </h2>
              <button 
                className="text-gray-400 hover:text-white transition"
                onClick={() => {
                  isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false);
                  dispatch(clearCurrentWallet());
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={isCreateModalOpen ? handleSubmitCreate : handleSubmitEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Network {isCreateModalOpen && '*'}
                  </label>
                  {isCreateModalOpen ? (
                    <select
                      required
                      value={formData.network}
                      onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600"
                    >
                      <option value="">Select Network</option>
                      {networks.map(network => (
                        <option key={network} value={network}>
                          {formatNetwork(network)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formatNetwork(formData.network)}
                      disabled
                      className="w-full bg-gray-700 text-gray-400 px-3 py-2 rounded-lg border border-gray-600 cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wallet Address *
                  </label>
                  <textarea
                    required
                    value={formData.wallet_address}
                    onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                    placeholder="Enter wallet address"
                    rows={3}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600 resize-none"
                  />
                </div>

                {/* QR Code Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      QR Code
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateQRCode}
                      disabled={!formData.wallet_address || !formData.network || generatingQR}
                      className="flex items-center space-x-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <QrCode size={12} />
                      <span>{generatingQR ? 'Generating...' : 'Generate QR'}</span>
                    </button>
                  </div>
                  
                  {formData.qr_code ? (
                    <div className="mt-2 bg-white p-3 rounded-lg flex justify-center">
                      <img 
                        src={formData.qr_code} 
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">
                        {!formData.wallet_address || !formData.network 
                          ? 'Enter network and wallet address to generate QR code'
                          : 'QR code will be generated automatically or click Generate QR'
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes (optional)"
                    rows={2}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 border border-gray-600 resize-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
                    Active (wallet will be available for deposits)
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false);
                    dispatch(clearCurrentWallet());
                  }}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (isCreateModalOpen ? 'Create Wallet' : 'Update Wallet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && currentWallet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1f2225] rounded-3xl shadow-2xl p-6 w-full max-w-md transform transition-transform duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {formatNetwork(currentWallet.network)} Wallet
              </h2>
              <button 
                className="text-gray-400 hover:text-white transition"
                onClick={() => {
                  setIsViewModalOpen(false);
                  dispatch(clearCurrentWallet());
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(currentWallet.is_active)}`}>
                  {getStatusText(currentWallet.is_active)}
                </span>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-300 font-mono break-all">
                    {currentWallet.wallet_address}
                  </p>
                  <button 
                    onClick={() => handleCopy(currentWallet.wallet_address, `view-address-${currentWallet.id}`)}
                    className="text-gray-400 hover:text-white ml-2 flex-shrink-0"
                  >
                    {copiedField === `view-address-${currentWallet.id}` ? 
                      <CheckCircle2 size={16} className="text-green-500" /> : 
                      <Copy size={16} />
                    }
                  </button>
                </div>
              </div>

              {currentWallet.qr_code && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">QR Code</label>
                  <div className="bg-white p-3 rounded-lg flex justify-center">
                    <img 
                      src={currentWallet.qr_code} 
                      alt={`${currentWallet.network} QR Code`}
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {currentWallet.notes && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notes</label>
                  <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                    {currentWallet.notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                <p>Created: {new Date(currentWallet.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(currentWallet.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(currentWallet);
                }}
                className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-colors"
              >
                Edit Wallet
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  dispatch(clearCurrentWallet());
                }}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onClose={setIsDeleteModalOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#1f2225] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle className="text-lg font-semibold text-white">
                  Delete Wallet Address
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    Are you sure you want to delete the {walletToDelete?.network} wallet address?
                    This action cannot be undone and users will no longer be able to deposit to this address.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
              <button
                onClick={handleConfirmDelete}
                className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 sm:w-auto"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}