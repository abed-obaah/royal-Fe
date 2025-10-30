import React, { useState, useEffect } from 'react';
import { profileApi } from '../../api/profile';

interface TwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEnabled: boolean;
}

interface BackupCodes {
  codes: string[];
  showed: boolean;
}

export default function TwoFAModal({ isOpen, onClose, onSuccess, isEnabled }: TwoFAModalProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'disable' | 'backup'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes, setBackupCodes] = useState<BackupCodes>({ codes: [], showed: false });
  const [qrCodeError, setQrCodeError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEnabled) {
        setStep('disable');
      } else {
        generateSecret();
      }
    }
  }, [isOpen, isEnabled]);

  // Function to generate QR code using multiple services as fallback
  const generateQRCodeFallback = (secret: string, email: string = 'user@example.com') => {
    const appName = encodeURIComponent('Royafi'); // Replace with your app name
    const otpUrl = `otpauth://totp/${appName}:${encodeURIComponent(email)}?secret=${secret}&issuer=${appName}`;
    
    // Multiple QR code services as fallback
    const services = [
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUrl)}`,
      `https://quickchart.io/qr?text=${encodeURIComponent(otpUrl)}&size=200`,
      `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(otpUrl)}&choe=UTF-8`
    ];
    
    return services;
  };

  const generateSecret = async () => {
    try {
      setLoading(true);
      setError('');
      setQrCodeError(false);
      console.log('Generating 2FA secret...');
      
      const data = await profileApi.generateTwoFactorSecret();
      console.log('2FA Secret Response:', data);
      
      setQrCodeUrl(data.qr_code_url);
      setSecret(data.secret);
      
      // Use the backend URL first, then fallbacks
      if (data.qr_code_image_url) {
        console.log('Using backend QR code URL:', data.qr_code_image_url);
        setQrCodeImageUrl(data.qr_code_image_url);
      } else if (data.qr_code_url) {
        console.log('Using QR code URL with fallback services');
        const fallbacks = generateQRCodeFallback(data.secret);
        setQrCodeImageUrl(fallbacks[0]); // Use first fallback
      }
      
      setStep('verify');
    } catch (err: any) {
      console.error('Error generating 2FA secret:', err);
      setError(err.response?.data?.message || 'Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await profileApi.enableTwoFactor({ code: verificationCode });
      
      // Check if backup codes are returned (new functionality)
      if (response.backup_codes) {
        setBackupCodes({ codes: response.backup_codes, showed: false });
        setStep('backup');
      } else {
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please check the code and try again.');
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
      setError(err.response?.data?.message || 'Failed to disable 2FA. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowBackupCodes = () => {
    setBackupCodes(prev => ({ ...prev, showed: true }));
  };

  const handleBackupCodesConfirmed = () => {
    onSuccess();
    onClose();
    resetForm();
  };

  const handleQRCodeError = () => {
    console.error('QR code failed to load:', qrCodeImageUrl);
    setQrCodeError(true);
    
    // Try next fallback if available
    if (secret) {
      const fallbacks = generateQRCodeFallback(secret);
      const currentIndex = fallbacks.findIndex(url => url === qrCodeImageUrl);
      if (currentIndex < fallbacks.length - 1) {
        const nextUrl = fallbacks[currentIndex + 1];
        console.log('Trying next QR code service:', nextUrl);
        setQrCodeImageUrl(nextUrl);
        setQrCodeError(false);
      }
    }
  };

  const resetForm = () => {
    setStep('setup');
    setQrCodeUrl('');
    setQrCodeImageUrl('');
    setSecret('');
    setVerificationCode('');
    setDisablePassword('');
    setError('');
    setBackupCodes({ codes: [], showed: false });
    setQrCodeError(false);
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
          {isEnabled ? 'Disable Two-Factor Authentication' : 
           step === 'backup' ? 'Backup Codes' : 'Setup Two-Factor Authentication'}
        </h2>

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-gray-400 text-sm space-y-2">
              <p>1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              <p>2. Or enter the secret key manually</p>
              <p>3. Enter the 6-digit code from the app to verify</p>
            </div>

            {/* QR Code Section with Debugging */}
            <div className="flex flex-col items-center space-y-4">
              {qrCodeImageUrl && !qrCodeError ? (
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={qrCodeImageUrl} 
                    alt="QR Code for 2FA Setup" 
                    className="w-48 h-48"
                    onError={handleQRCodeError}
                    onLoad={() => console.log('QR Code loaded successfully:', qrCodeImageUrl)}
                  />
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed border-gray-600 rounded-lg">
                  <div className="text-yellow-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-yellow-400 text-sm font-semibold">QR Code Not Available</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Please use the manual secret key below
                  </p>
                </div>
              )}

              {/* Debug Info - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 bg-black bg-opacity-50 p-2 rounded">
                  <div>Secret: {secret ? '✓' : '✗'}</div>
                  <div>QR URL: {qrCodeImageUrl ? '✓' : '✗'}</div>
                  <div>QR Error: {qrCodeError ? '✓' : '✗'}</div>
                </div>
              )}
            </div>

            {secret && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Manual entry secret:</p>
                <code className="bg-[#1a1d21] px-3 py-2 rounded text-white text-sm break-all block">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    // You could add a toast notification here
                  }}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Copy to clipboard
                </button>
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
                    autoComplete="one-time-code"
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
              <p className="text-yellow-400 mt-2">Warning: This will remove the extra security from your account.</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full bg-[#1a1d21] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
                autoComplete="current-password"
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

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="text-gray-400 text-sm">
              <p className="text-yellow-400 font-semibold mb-2">Important: Save these backup codes!</p>
              <p>These codes can be used to access your account if you lose your authenticator device.</p>
              <p>Store them in a safe place - each code can only be used once.</p>
            </div>

            {backupCodes.showed ? (
              <div className="bg-[#1a1d21] p-4 rounded grid grid-cols-2 gap-2">
                {backupCodes.codes.map((code, index) => (
                  <code key={index} className="text-white text-sm font-mono text-center py-1">
                    {code}
                  </code>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <button
                  onClick={handleShowBackupCodes}
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Show Backup Codes
                </button>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={handleBackupCodesConfirmed}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                I've Saved My Codes
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}