"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import { adminApi, KYCVerification } from "../../api/admin";

export default function KycDashboard() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Fetch verifications
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllVerifications();
      setVerifications(response.verifications || []);
    } catch (err: any) {
      setError("Failed to load KYC verifications");
      console.error("Error fetching verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  // Filter verifications based on selected filter
  const filteredVerifications = verifications.filter(verification => {
    if (filter === 'all') return true;
    return verification.status === filter;
  });

  const handleApprove = async (verificationId: number) => {
    try {
      await adminApi.approveVerification(verificationId);
      // Update local state
      setVerifications(prev =>
        prev.map(v =>
          v.id === verificationId
            ? { ...v, status: 'approved', reason: null }
            : v
        )
      );
    } catch (err: any) {
      console.error("Error approving verification:", err);
      alert("Failed to approve verification");
    }
  };

  const handleReject = async (verificationId: number, reason: string) => {
    try {
      await adminApi.rejectVerification(verificationId, reason);
      // Update local state
      setVerifications(prev =>
        prev.map(v =>
          v.id === verificationId
            ? { ...v, status: 'rejected', reason }
            : v
        )
      );
      setShowRejectModal(false);
      setSelectedVerification(null);
      setRejectReason("");
    } catch (err: any) {
      console.error("Error rejecting verification:", err);
      alert("Failed to reject verification");
    }
  };

  const handleView = (img: string) => {
    setSelectedImage(img);
    setOpen(true);
  };

  const openRejectModal = (verification: KYCVerification) => {
    setSelectedVerification(verification);
    setShowRejectModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return "bg-green-900 text-green-300";
      case 'rejected': return "bg-red-900 text-red-300";
      case 'pending': return "bg-yellow-900 text-yellow-300";
      default: return "bg-gray-900 text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return "Verified";
      case 'rejected': return "Rejected";
      case 'pending': return "Pending";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222629] p-6 text-white rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading KYC verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222629] p-6 text-white rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">KYC Verification Dashboard</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchVerifications}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
          {error}
          <button
            onClick={fetchVerifications}
            className="ml-4 text-blue-400 hover:text-blue-300 underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="bg-gray-900 rounded-xl shadow p-6">
        {filteredVerifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No KYC verifications found
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">ID Documents</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVerifications.map((verification) => (
                <tr
                  key={verification.id}
                  className="bg-gray-800 hover:bg-gray-700 transition rounded-lg"
                >
                  <td className="px-4 py-3 font-medium">{verification.user_name}</td>
                  <td className="px-4 py-3 text-gray-300">{verification.user_email}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {verification.id_front && (
                      <Eye
                        className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer"
                        onClick={() => handleView(verification.id_front!)}
                        title="View Front ID"
                      />
                    )}
                    {verification.id_back && (
                      <Eye
                        className="w-5 h-5 text-green-400 hover:text-green-300 cursor-pointer"
                        onClick={() => handleView(verification.id_back!)}
                        title="View Back ID"
                      />
                    )}
                    {!verification.id_front && !verification.id_back && (
                      <span className="text-gray-500 text-sm">No documents</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(verification.status)}`}
                    >
                      {getStatusText(verification.status)}
                    </span>
                    {verification.reason && (
                      <div className="text-xs text-gray-400 mt-1 max-w-xs">
                        Reason: {verification.reason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    {verification.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(verification.id)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(verification)}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    {verification.status !== 'pending' && (
                      <span className="text-gray-500 text-sm">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Image Preview */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-gray-900 rounded-lg shadow-lg overflow-hidden max-w-4xl w-full max-h-[90vh]">
            {selectedImage && (
              <div className="p-4">
                <img
                  src={selectedImage}
                  alt="ID Document"
                  className="w-full h-auto max-h-[70vh] object-contain rounded"
                />
              </div>
            )}
            <div className="p-4 flex justify-end border-t border-gray-700">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={showRejectModal} onClose={() => setShowRejectModal(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Verification</h3>
            <p className="text-gray-300 mb-4">
              Please provide a reason for rejecting {selectedVerification?.user_name}'s verification:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedVerification && handleReject(selectedVerification.id, rejectReason)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}