import React, { useState, useEffect } from 'react';
import { profileApi } from '../../api/profile';

interface TwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEnabled: boolean;
}

export default function TwoFAModal({ isOpen, onClose, onSuccess, isEnabled }: TwoFAModalProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'disable'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEnabled) {
        setStep('disable');
      } else {
        generateSecret();
      }
    }
  }, [isOpen, isEnabled]);

  const generateSecret = async () => {
    try {
      const data = await profileApi.generateTwoFactorSecret();
      setQrCodeUrl(data.qr_code_url);
      setSecret(data.secret);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate 2FA secret');
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await profileApi.enableTwoFactor({ code: verificationCode });
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await profileApi.disableTwoFactor({ password: disablePassword });
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('setup');
    setQrCodeUrl('');
    setSecret('');
    setVerificationCode('');
    setDisablePassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#222629] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-white text-lg font-semibold mb-4">
          {isEnabled ? 'Disable Two-Factor Authentication' : 'Setup Two-Factor Authentication'}
        </h2>

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-gray-400 text-sm">
              <p>1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              <p>2. Enter the 6-digit code from the app to verify</p>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 bg-white p-4 rounded" />
              </div>
            )}

            {secret && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Or enter this secret manually:</p>
                <code className="bg-[#1a1d21] px-3 py-2 rounded text-white text-sm break-all">
                  {secret}
                </code>
              </div>
            )}

            <form onSubmit={handleEnable2FA}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-[#1a1d21] border border-gray-600 rounded px-3 py-2 text-white text-center text-xl tracking-widest focus:outline-none focus:border-blue-500"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 'disable' && (
          <form onSubmit={handleDisable2FA} className="space-y-4">
            <div className="text-gray-400 text-sm">
              <p>Enter your password to disable Two-Factor Authentication.</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full bg-[#1a1d21] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}