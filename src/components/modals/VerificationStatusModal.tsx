import React from 'react';
import { Verification } from '../../api/profile';

interface VerificationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: Verification | null;
  onUploadId: () => void;
}

export default function VerificationStatusModal({ 
  isOpen, 
  onClose, 
  verification, 
  onUploadId 
}: VerificationStatusModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#222629] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-white text-lg font-semibold mb-4">Account Verification Status</h2>
        
        {!verification ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-400 mb-4">You haven't submitted ID verification yet.</p>
            <button
              onClick={onUploadId}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Start Verification
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status */}
            <div className="text-center">
              <div className="text-4xl mb-2">{getStatusIcon(verification.status)}</div>
              <div className={`text-lg font-semibold ${getStatusColor(verification.status)}`}>
                {verification.status.toUpperCase()}
              </div>
              {verification.reason && (
                <div className="mt-2 p-3 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded text-yellow-400 text-sm">
                  <strong>Reason:</strong> {verification.reason}
                </div>
              )}
            </div>

            {/* Submitted Images */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Front of ID</h4>
                {verification.id_front_base64 ? (
                  <img 
                    src={verification.id_front_base64} 
                    alt="Front of ID" 
                    className="w-full h-32 object-cover rounded border border-gray-600"
                  />
                ) : (
                  <div className="w-full h-32 bg-[#1a1d21] rounded border border-gray-600 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Back of ID</h4>
                {verification.id_back_base64 ? (
                  <img 
                    src={verification.id_back_base64} 
                    alt="Back of ID" 
                    className="w-full h-32 object-cover rounded border border-gray-600"
                  />
                ) : (
                  <div className="w-full h-32 bg-[#1a1d21] rounded border border-gray-600 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              {verification.status === 'rejected' && (
                <button
                  onClick={onUploadId}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Upload Again
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}