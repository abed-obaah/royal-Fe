// components/KYCVerificationModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { profileApi, UploadIdRequest } from '../api/profile';

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSubmitted: () => void;
  onDepositRequired?: () => void; // New prop for deposit requirement
  currentStatus?: 'not_submitted' | 'pending' | 'rejected';
  hasBalance?: boolean; // New prop to check if user has balance
}

export default function KYCVerificationModal({ 
  isOpen, 
  onClose, 
  onVerificationSubmitted,
  onDepositRequired,
  currentStatus = 'not_submitted',
  hasBalance = false // Default to false for safety
}: KYCVerificationModalProps) {
  const [idFront, setIdFront] = useState<string>('');
  const [idBack, setIdBack] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState({
    front: false,
    back: false
  });

  const handleFileUpload = (file: File, type: 'front' | 'back'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (type === 'front') {
          setIdFront(base64.split(',')[1]);
          setUploadedFiles(prev => ({ ...prev, front: true }));
        } else {
          setIdBack(base64.split(',')[1]);
          setUploadedFiles(prev => ({ ...prev, back: true }));
        }
        setError('');
        resolve();
      };
      reader.onerror = () => {
        setError(`Failed to read ${type} file`);
        reject();
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      handleFileUpload(file, 'front');
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      handleFileUpload(file, 'back');
    }
  };

  const handleSubmit = async () => {
    if (!idFront || !idBack) {
      setError('Please upload both front and back of your ID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const request: UploadIdRequest = {
        id_front: idFront,
        id_back: idBack
      };

      await profileApi.uploadIdVerification(request);
      
      // Close modal first
      onVerificationSubmitted();
      
      // Show deposit message only for first-time users with zero balance
      if (!hasBalance && onDepositRequired) {
        // Small delay to ensure modal is closed before showing deposit message
        setTimeout(() => {
          onDepositRequired();
        }, 300);
      }
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload verification documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'rejected':
        return {
          title: 'Verification Required - Update Needed',
          description: 'Your previous verification was rejected. Please upload new documents to complete KYC.',
          color: 'red'
        };
      case 'pending':
        return {
          title: 'Verification Under Review',
          description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
          color: 'yellow'
        };
      default:
        return {
          title: 'Identity Verification Required',
          description: 'Complete KYC to access all investment features and higher limits.',
          color: 'blue'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-[1000]">
      <DialogBackdrop className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                statusInfo.color === 'red' ? 'bg-red-100' : 
                statusInfo.color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <DocumentTextIcon className={`w-6 h-6 ${
                  statusInfo.color === 'red' ? 'text-red-600' : 
                  statusInfo.color === 'yellow' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {statusInfo.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Requirements Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Accepted Documents:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Passport</li>
              <li>• Driver's License</li>
              <li>• National ID Card</li>
              <li>• State ID Card</li>
            </ul>
            <div className="mt-3 text-xs text-gray-500">
              <p>• Ensure documents are valid and not expired</p>
              <p>• Photos must be clear and all text readable</p>
              <p>• Files must be under 5MB each</p>
            </div>
          </div>

          {/* Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Front ID Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Front of ID Document {uploadedFiles.front && <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-1" />}
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                uploadedFiles.front 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrontFileChange}
                  className="hidden"
                  id="front-upload"
                />
                <label
                  htmlFor="front-upload"
                  className="cursor-pointer block"
                >
                  <DocumentTextIcon className={`mx-auto h-8 w-8 ${
                    uploadedFiles.front ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span className={`mt-2 block text-sm font-medium ${
                    uploadedFiles.front ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {uploadedFiles.front ? 'Front Uploaded' : 'Upload Front of ID'}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Clear photo of the front
                  </span>
                </label>
              </div>
            </div>

            {/* Back ID Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Back of ID Document {uploadedFiles.back && <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-1" />}
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                uploadedFiles.back 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackFileChange}
                  className="hidden"
                  id="back-upload"
                />
                <label
                  htmlFor="back-upload"
                  className="cursor-pointer block"
                >
                  <DocumentTextIcon className={`mx-auto h-8 w-8 ${
                    uploadedFiles.back ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span className={`mt-2 block text-sm font-medium ${
                    uploadedFiles.back ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {uploadedFiles.back ? 'Back Uploaded' : 'Upload Back of ID'}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Required for most ID types
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !idFront || !idBack}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit for Verification'
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Your documents are encrypted and stored securely. By submitting, you agree to our verification process.
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}