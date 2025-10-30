// components/Login2FAModal.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import api from "../services/axios";

interface Login2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
  tempToken: string;
  userId: number;
}

interface Verify2FALoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    email_verified_at: string;
  };
}

interface VerifyBackupCodeResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    email_verified_at: string;
  };
  remaining_backup_codes: number;
}

export default function Login2FAModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  tempToken, 
  userId 
}: Login2FAModalProps) {
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<Verify2FALoginResponse>("/verify-2fa-login", {
        temp_token: tempToken,
        code: code
      });
      
      onSuccess(response.data.user, response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<VerifyBackupCodeResponse>("/verify-backup-code-login", {
        temp_token: tempToken,
        backup_code: backupCode
      });
      
      onSuccess(response.data.user, response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid backup code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#222629] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-white text-lg font-semibold mb-4">
          Two-Factor Authentication Required
        </h2>

        {!useBackupCode ? (
          <>
            <div className="text-gray-400 text-sm mb-4">
              <p>Enter the 6-digit code from your authenticator app.</p>
            </div>

            <form onSubmit={handle2FASubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Verification Code</label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-[#1a1d21] border border-gray-600 rounded px-3 py-2 text-white text-center text-xl tracking-widest focus:outline-none focus:border-blue-500"
                    maxLength={6}
                    required
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUseBackupCode(true)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm border-gray-600"
                  >
                    Use Backup Code Instead
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-gray-400 text-sm mb-4">
              <p className="text-yellow-400 mb-2">Lost your authenticator device?</p>
              <p>Enter one of your backup codes to access your account.</p>
              <p className="text-xs mt-2">Each backup code can only be used once.</p>
            </div>

            <form onSubmit={handleBackupCodeSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Backup Code</label>
                  <Input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    placeholder="A1B2C3D4E5"
                    className="w-full bg-[#1a1d21] border border-gray-600 rounded px-3 py-2 text-white text-center uppercase tracking-wider focus:outline-none focus:border-blue-500"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUseBackupCode(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors border-gray-600"
                    disabled={loading}
                  >
                    Back to 2FA Code
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !backupCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Backup Code'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}