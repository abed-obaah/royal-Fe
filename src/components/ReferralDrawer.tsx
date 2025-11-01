import React, { useState, useEffect } from "react";
import { X, CopyIcon, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../slices/userSlice";
import { clearCredentials } from "../slices/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { referralApi } from "../api/referralApi";

export default function ReferralDrawer({ open, onClose }) {
  const [view, setView] = useState("referral"); // "referral" | "history"
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.user.token);
  const [copied, setCopied] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch referral earnings data when history view is opened
  useEffect(() => {
    if (open && view === "history") {
      fetchReferralEarnings();
    }
  }, [open, view]);

  const fetchReferralEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await referralApi.getReferralEarnings();
      setEarningsData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load referral earnings");
      console.error("Error fetching referral earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetAndClose = () => {
    setView("referral");
    setEarningsData(null);
    setError(null);
    onClose();
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={resetAndClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#222629] shadow-xl transform transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            {/* Back button (only on history screen) */}
            {view === "history" && (
              <button onClick={() => setView("referral")}>
                <ArrowLeft className="w-6 h-6 text-white hover:text-gray-300" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">
              {view === "referral" ? "Referrals" : "Invite History"}
            </h2>
          </div>

          <button onClick={resetAndClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {view === "referral" ? (
            // ---------------- Referral UI ----------------
            <div className="text-center space-y-6">
              <img
                src="https://testapp.artsplit.com/images/referral-cash.svg"
                alt="Referral"
                className="w-32 mx-auto"
              />

              <p className="text-white text-sm">
                Invite your friends and family to start investing now on the
                Royafi with your referral code and earn money.
              </p>

              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <p className="text-sm text-black">Share your referral code</p>
                <h3 className="text-2xl font-bold text-blue-900 flex justify-center items-center gap-2">
                 {user?.referral_code || ''}
                   <CopyIcon
                    onClick={handleCopy}
                    className="w-6 h-6 text-gray-500 hover:text-black cursor-pointer"
                  />
                </h3>

                {copied && (
                  <p className="text-green-600 text-sm mt-2 transition-opacity duration-300">
                    Copied to clipboard!
                  </p>
                )}
              </div>

              <div className="text-left">
                <h4 className="font-semibold text-white mb-2">
                  Here's how it works
                </h4>
                <ul className="space-y-2 text-sm text-white">
                  <li>
                    • Invest <span className="font-bold">at least $20</span> to
                    become eligible.
                  </li>
                  <li>• Share your unique referral link.</li>
                  <li>• Your friends sign up, invest $10+, and you earn.</li>
                </ul>
              </div>

              <button
                className="text-blue-400 font-medium hover:underline"
                onClick={() => setView("history")}
              >
                Invites history →
              </button>
            </div>
          ) : (
            // ---------------- Invite History UI ----------------
            <div className="space-y-6">
              {loading && (
                <div className="text-center text-white">
                  <p>Loading referral earnings...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                  <button 
                    onClick={fetchReferralEarnings}
                    className="mt-2 text-sm underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && earningsData && (
                <>
                  <p className="text-center text-white">
                    You have invited{" "}
                    <span className="font-bold">
                      {earningsData.summary.successful_referrals} friends
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500">Amount earned</p>
                      <h3 className="text-2xl font-bold text-blue-900">
                        {earningsData.summary.formatted.total_earnings}
                      </h3>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500">Amount pending</p>
                      <h3 className="text-2xl font-bold text-blue-900">
                        {earningsData.summary.formatted.pending_earnings}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Your friends simply need to:
                    </h4>
                    <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                      <li>Sign up using your link or code.</li>
                      <li>Verify their identity (KYC).</li>
                      <li>Fund their wallet.</li>
                      <li>Invest $10+ in any asset.</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-400 mb-2">REFERRAL EARNINGS HISTORY</h4>
                    
                    {earningsData.earnings_history.length === 0 ? (
                      <div className="flex flex-col items-center text-gray-500">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png"
                          alt="No referrals"
                          className="w-16 opacity-70 invert brightness-0"
                        />
                        <p>No referral earnings yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {earningsData.earnings_history.map((earning) => (
                          <div
                            key={earning.id}
                            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-semibold text-white">
                                  {earning.referred_user_name}
                                </h5>
                                <p className="text-sm text-gray-400">
                                  {earning.referred_user_email}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(earning.status)}`}>
                                {earning.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-400">Commission</p>
                                <p className="text-green-400 font-semibold">
                                  ${parseFloat(earning.amount).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Their Investment</p>
                                <p className="text-white font-semibold">
                                  ${parseFloat(earning.investment_amount).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              {earning.earned_at}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Eligibility Notice */}
                  {!earningsData.summary.is_eligible && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                      <p className="text-sm">
                        <strong>Note:</strong> You need to invest at least $20 to become eligible for referral earnings.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Show default state when no data is loaded yet */}
              {!loading && !error && !earningsData && (
                <>
                  <p className="text-center text-white">
                    You have invited <span className="font-bold">0 friends</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500">Amount earned</p>
                      <h3 className="text-2xl font-bold text-blue-900">$0</h3>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-500">Amount pending</p>
                      <h3 className="text-2xl font-bold text-blue-900">$0</h3>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Your friends simply need to:
                    </h4>
                    <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                      <li>Sign up using your link or code.</li>
                      <li>Verify their identity (KYC).</li>
                      <li>Fund their wallet.</li>
                      <li>Invest $10+ in any asset.</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-400 mb-2">REFERRALS</h4>
                    <div className="flex flex-col items-center text-gray-500">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png"
                        alt="No referrals"
                        className="w-16 opacity-70 invert brightness-0"
                      />
                      <p>No referrals yet</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}