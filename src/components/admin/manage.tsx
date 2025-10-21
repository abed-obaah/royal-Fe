"use client";

import React, { useState, useEffect } from "react";
import { Search, MoreVertical, X, Camera, Key, Wallet, Eye, EyeOff, RefreshCw, AlertCircle } from "lucide-react";
import { adminUsersApi, AdminUser, UserDetails, UserInvestment } from "../../api/adminUsers";

export default function UserManagementExtended() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    role: "user"
  });
  const [newPassword, setNewPassword] = useState({ password: "", password_confirmation: "" });
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all users
  const fetchUsers = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminUsersApi.getUsers(filters);
      setUsers(response.users);
    } catch (err: any) {
      setError("Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId: number) => {
    try {
      const response = await adminUsersApi.getUserDetails(userId);
      setUserDetails(response);
      
      // Also fetch investments
      const investmentsResponse = await adminUsersApi.getUserInvestments(userId);
      setUserInvestments(investmentsResponse.investments);
    } catch (err: any) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details");
    }
  };

  // Select user handler
  const selectUser = async (user: AdminUser) => {
    setSelectedUser(user);
    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      status: user.status,
      role: user.role
    });
    await fetchUserDetails(user.id);
  };

  // Update user profile
  const handleUpdateProfile = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminUsersApi.updateUserProfile(userId, profileForm);
      await fetchUsers(); // Refresh users list
      if (selectedUser) await fetchUserDetails(selectedUser.id); // Refresh details
      setModal(null);
    } catch (err: any) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset user password
  const handleResetPassword = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminUsersApi.resetUserPassword(userId, { ...newPassword, notify_user: true });
      setModal(null);
      setNewPassword({ password: "", password_confirmation: "" });
    } catch (err: any) {
      setError("Failed to reset password");
      console.error("Error resetting password:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Verify/Unverify email
  const handleVerifyEmail = async (userId: number, verify: boolean) => {
    try {
      setActionLoading(true);
      if (verify) {
        await adminUsersApi.verifyUserEmail(userId);
      } else {
        await adminUsersApi.unverifyUserEmail(userId);
      }
      await fetchUsers();
      if (selectedUser) await fetchUserDetails(selectedUser.id);
    } catch (err: any) {
      setError(`Failed to ${verify ? 'verify' : 'unverify'} email`);
      console.error("Error updating email verification:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Update user status
  const handleUpdateStatus = async (userId: number, status: string) => {
    try {
      setActionLoading(true);
      await adminUsersApi.updateUserStatus(userId, { status, reason: "Updated by admin" });
      await fetchUsers();
      if (selectedUser) await fetchUserDetails(selectedUser.id);
    } catch (err: any) {
      setError("Failed to update status");
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Credit/Debit wallet
  const handleCreditDebit = async (userId: number) => {
    try {
      setActionLoading(true);
      const amount = parseFloat(creditAmount);
      if (isNaN(amount)) {
        setError("Invalid amount");
        return;
      }

      if (amount >= 0) {
        await adminUsersApi.creditUserWallet(userId, {
          amount: Math.abs(amount),
          reason: creditReason || "Admin credit",
          reference: `ADM-CR-${Date.now()}`
        });
      } else {
        await adminUsersApi.debitUserWallet(userId, {
          amount: Math.abs(amount),
          reason: creditReason || "Admin debit",
          reference: `ADM-DB-${Date.now()}`
        });
      }

      setModal(null);
      setCreditAmount("");
      setCreditReason("");
      await fetchUsers();
      if (selectedUser) await fetchUserDetails(selectedUser.id);
    } catch (err: any) {
      setError("Failed to process transaction");
      console.error("Error processing credit/debit:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset wallet balance
  const handleResetWallet = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminUsersApi.resetUserWallet(userId, { reason: "Reset by admin" });
      await fetchUsers();
      if (selectedUser) await fetchUserDetails(selectedUser.id);
    } catch (err: any) {
      setError("Failed to reset wallet");
      console.error("Error resetting wallet:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke investment
  const handleRevokeInvestment = async (userId: number, investmentId: number) => {
    try {
      setActionLoading(true);
      await adminUsersApi.revokeInvestment(userId, investmentId);
      await fetchUserDetails(userId);
    } catch (err: any) {
      setError("Failed to revoke investment");
      console.error("Error revoking investment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear portfolio
  const handleClearPortfolio = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminUsersApi.clearUserPortfolio(userId, { reason: "Cleared by admin" });
      await fetchUserDetails(userId);
    } catch (err: any) {
      setError("Failed to clear portfolio");
      console.error("Error clearing portfolio:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toString().includes(query)
    );
  });

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#222629] text-white">
      {/* Left list */}
      <div className="w-full md:w-1/3 border-r border-gray-800 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user..."
            className="flex-1 text-gray-200 px-3 py-2 rounded-md focus:outline-none bg-gray-800"
          />
          <button
            onClick={() => fetchUsers()}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div>{filteredUsers.length} users</div>
          {loading && <div className="text-blue-400">Loading...</div>}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => selectUser(user)}
              className={`p-4 rounded-lg cursor-pointer flex items-center gap-3 ${
                selectedUser?.id === user.id ? "bg-blue-600" : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-semibold">
                {user.name.split(" ").map((s) => s[0]).slice(0,2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="truncate">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-300 truncate">{user.email}</div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    user.is_email_verified ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                  }`}>
                    {user.is_email_verified ? "Verified" : "Unverified"}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    user.status === 'active' ? 'bg-green-900 text-green-300' : 
                    user.status === 'suspended' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right details */}
      <div className="flex-1 p-6">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a user to manage
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                  <div className="text-2xl text-gray-400">
                    {selectedUser.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <p className="text-gray-400 text-sm">ID: {selectedUser.id}</p>
                  <div className="mt-3 flex gap-2 text-sm">
                    <button 
                      onClick={() => setModal("editProfile")} 
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                      disabled={actionLoading}
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => { setModal("password"); setNewPassword({ password: "", password_confirmation: "" }); }} 
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-2"
                      disabled={actionLoading}
                    >
                      <Key className="w-4 h-4" /> Reset Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="ml-auto grid grid-cols-1 gap-2 w-full md:w-64">
                <div className="bg-gray-900 p-4 rounded-lg text-sm">
                  <div className="text-gray-400">Balance</div>
                  <div className="text-lg font-semibold mb-3">
                    ${selectedUser.total_balance.toFixed(2)} USD
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={() => { setModal("credit"); setCreditAmount(""); setCreditReason(""); }}
                      className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded flex items-center justify-center gap-2 text-sm"
                      disabled={actionLoading}
                    >
                      <Wallet className="w-4 h-4" /> Credit/Debit
                    </button>
                    <button
                      onClick={() => handleResetWallet(selectedUser.id)}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      disabled={actionLoading}
                    >
                      {actionLoading ? "..." : "Reset"}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg text-sm">
                  <div className="text-gray-400">Verification</div>
                  <div className="mt-2 flex gap-2">
                    <button 
                      onClick={() => handleVerifyEmail(selectedUser.id, true)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                      disabled={actionLoading || selectedUser.is_email_verified}
                    >
                      {actionLoading ? "..." : "Verify Email"}
                    </button>
                    <button 
                      onClick={() => handleVerifyEmail(selectedUser.id, false)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                      disabled={actionLoading || !selectedUser.is_email_verified}
                    >
                      {actionLoading ? "..." : "Unverify"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg text-sm">
                <div className="text-gray-400">User ID</div>
                <div className="font-medium">{selectedUser.id}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg text-sm">
                <div className="text-gray-400">Last Login</div>
                <div className="font-medium">{selectedUser.last_login}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg text-sm">
                <div className="text-gray-400">Registered</div>
                <div className="font-medium">{selectedUser.registered}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg text-sm">
                <div className="text-gray-400">Status</div>
                <div className="font-medium flex items-center gap-2">
                  {selectedUser.status}
                  <select 
                    value={selectedUser.status} 
                    onChange={(e) => handleUpdateStatus(selectedUser.id, e.target.value)}
                    className="bg-gray-800 text-white text-xs p-1 rounded"
                    disabled={actionLoading}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Balance Breakdown */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Balance Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-gray-400 text-sm">Available Balance</div>
                  <div className="text-lg font-semibold text-green-400">${selectedUser.wallet_balance.toFixed(2)}</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-gray-400 text-sm">Invested Balance</div>
                  <div className="text-lg font-semibold text-blue-400">${selectedUser.invested_balance.toFixed(2)}</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-gray-400 text-sm">Total Balance</div>
                  <div className="text-lg font-semibold">${selectedUser.total_balance.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Investments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Investments</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleClearPortfolio(selectedUser.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                    disabled={actionLoading || userInvestments.length === 0}
                  >
                    {actionLoading ? "..." : "Clear Portfolio"}
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                {userInvestments.length > 0 ? (
                  <div className="space-y-3">
                    {userInvestments.map((investment) => (
                      <div key={investment.id} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                        <div className="flex-1">
                          <div className="font-medium">{investment.asset?.title || 'Unknown Asset'}</div>
                          <div className="text-sm text-gray-400">
                            Quantity: {investment.quantity} • Purchase: ${investment.purchase_price} • Current: ${investment.current_price}
                          </div>
                          <div className="text-sm">
                            Value: <span className="font-semibold">${investment.current_value.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRevokeInvestment(selectedUser.id, investment.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                            disabled={actionLoading}
                          >
                            {actionLoading ? "..." : "Revoke"}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-sm text-gray-400">
                      Total Investments: ${userInvestments.reduce((sum, inv) => sum + inv.current_value, 0).toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">No investments found</div>
                )}
              </div>
            </div>

            {/* Statistics */}
            {userDetails?.statistics && (
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">User Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Total Deposits</div>
                    <div className="text-lg font-semibold">${userDetails.statistics.financial?.total_deposits?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Total Withdrawals</div>
                    <div className="text-lg font-semibold">${userDetails.statistics.financial?.total_withdrawals?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Total Orders</div>
                    <div className="text-lg font-semibold">{userDetails.statistics.activity?.total_orders || 0}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Days Registered</div>
                    <div className="text-lg font-semibold">{userDetails.statistics.account?.days_since_registration || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 rounded-xl shadow-lg w-full max-w-md overflow-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="text-lg font-semibold">
                {modal === "password" && "Set New Password"}
                {modal === "credit" && "Credit / Debit Wallet"}
                {modal === "editProfile" && "Edit Profile"}
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded hover:bg-gray-800" disabled={actionLoading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* PASSWORD MODAL */}
              {modal === "password" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-3">Set a new password for <strong>{selectedUser.name}</strong>.</p>
                  <input 
                    type="password"
                    value={newPassword.password} 
                    onChange={(e) => setNewPassword({...newPassword, password: e.target.value})} 
                    placeholder="New password" 
                    className="w-full p-2 rounded bg-gray-800 mb-3" 
                    disabled={actionLoading}
                  />
                  <input 
                    type="password"
                    value={newPassword.password_confirmation} 
                    onChange={(e) => setNewPassword({...newPassword, password_confirmation: e.target.value})} 
                    placeholder="Confirm password" 
                    className="w-full p-2 rounded bg-gray-800 mb-3" 
                    disabled={actionLoading}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal(null)} className="px-3 py-2 bg-gray-700 rounded" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleResetPassword(selectedUser.id)} 
                      className="px-3 py-2 bg-indigo-600 rounded flex items-center gap-2"
                      disabled={actionLoading || !newPassword.password || newPassword.password !== newPassword.password_confirmation}
                    >
                      {actionLoading ? "..." : "Set Password"}
                    </button>
                  </div>
                </>
              )}

              {/* CREDIT/DEBIT MODAL */}
              {modal === "credit" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-3">Enter amount to credit (positive) or debit (negative) the user's wallet.</p>
                  <input 
                    value={creditAmount} 
                    onChange={(e) => setCreditAmount(e.target.value)} 
                    placeholder="e.g. 100 or -50" 
                    className="w-full p-2 rounded bg-gray-800 mb-3" 
                    disabled={actionLoading}
                  />
                  <input 
                    value={creditReason} 
                    onChange={(e) => setCreditReason(e.target.value)} 
                    placeholder="Reason for transaction" 
                    className="w-full p-2 rounded bg-gray-800 mb-3" 
                    disabled={actionLoading}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal(null)} className="px-3 py-2 bg-gray-700 rounded" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleCreditDebit(selectedUser.id)} 
                      className="px-3 py-2 bg-green-600 rounded"
                      disabled={actionLoading || !creditAmount || !creditReason}
                    >
                      {actionLoading ? "..." : "Apply"}
                    </button>
                  </div>
                </>
              )}

              {/* EDIT PROFILE MODAL */}
              {modal === "editProfile" && selectedUser && (
                <>
                  <div className="space-y-3">
                    <input 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                      className="w-full p-2 rounded bg-gray-800" 
                      placeholder="Full name" 
                      disabled={actionLoading}
                    />
                    <input 
                      value={profileForm.email} 
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} 
                      className="w-full p-2 rounded bg-gray-800" 
                      placeholder="Email" 
                      disabled={actionLoading}
                    />
                    <input 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                      className="w-full p-2 rounded bg-gray-800" 
                      placeholder="Phone" 
                      disabled={actionLoading}
                    />
                    <select 
                      value={profileForm.status} 
                      onChange={(e) => setProfileForm({...profileForm, status: e.target.value})} 
                      className="w-full p-2 rounded bg-gray-800"
                      disabled={actionLoading}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select 
                      value={profileForm.role} 
                      onChange={(e) => setProfileForm({...profileForm, role: e.target.value})} 
                      className="w-full p-2 rounded bg-gray-800"
                      disabled={actionLoading}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setModal(null)} className="px-3 py-2 bg-gray-700 rounded" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleUpdateProfile(selectedUser.id)} 
                      className="px-3 py-2 bg-blue-600 rounded"
                      disabled={actionLoading}
                    >
                      {actionLoading ? "..." : "Save"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}