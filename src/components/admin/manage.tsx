"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  MoreVertical, 
  X, 
  Key, 
  Wallet, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle, 
  Edit, 
  SendToBack, 
  Trash2,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Menu
} from "lucide-react";
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
  const [walletForm, setWalletForm] = useState({
    available_balance: "",
    invested_balance: "",
    reason: ""
  });
  const [transferForm, setTransferForm] = useState({
    target_user_id: "",
    reason: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);

  // Mobile/Tablet state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch all users for transfer dropdown
  const fetchAllUsers = async () => {
    try {
      const response = await adminUsersApi.getUsers({ per_page: 1000 });
      setAllUsers(response.users);
    } catch (err) {
      console.error("Error fetching users for transfer:", err);
    }
  };

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
    setWalletForm({
      available_balance: user.wallet_balance.toString(),
      invested_balance: user.invested_balance.toString(),
      reason: ""
    });
    
    // Close sidebar on mobile when user is selected
    if (isMobile) {
      setIsSidebarOpen(false);
    }
    
    await fetchUserDetails(user.id);
  };

  // Update local users state after changes
  const updateUsersState = (updatedUser: AdminUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    
    if (selectedUser && selectedUser.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
  };

  // Update user profile
  const handleUpdateProfile = async (userId: number) => {
    try {
      setActionLoading(true);
      const response = await adminUsersApi.updateUserProfile(userId, profileForm);
      
      if (response.user) {
        updateUsersState(response.user);
        setSelectedUser(response.user);
      }
      
      if (selectedUser) await fetchUserDetails(selectedUser.id);
      
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
      setError(null);
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
      let response;
      if (verify) {
        response = await adminUsersApi.verifyUserEmail(userId);
      } else {
        response = await adminUsersApi.unverifyUserEmail(userId);
      }
      
      if (response.user) {
        updateUsersState(response.user);
        setSelectedUser(response.user);
      }
      
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
      const response = await adminUsersApi.updateUserStatus(userId, { status, reason: "Updated by admin" });
      
      if (response.user) {
        updateUsersState(response.user);
        setSelectedUser(response.user);
      }
      
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

      let response;
      if (amount >= 0) {
        response = await adminUsersApi.creditUserWallet(userId, {
          amount: Math.abs(amount),
          reason: creditReason || "Admin credit",
          reference: `ADM-CR-${Date.now()}`
        });
      } else {
        response = await adminUsersApi.debitUserWallet(userId, {
          amount: Math.abs(amount),
          reason: creditReason || "Admin debit",
          reference: `ADM-DB-${Date.now()}`
        });
      }

      if (selectedUser) {
        const updatedUser = {
          ...selectedUser,
          wallet_balance: amount >= 0 ? 
            selectedUser.wallet_balance + Math.abs(amount) : 
            selectedUser.wallet_balance - Math.abs(amount),
          total_balance: amount >= 0 ? 
            selectedUser.total_balance + Math.abs(amount) : 
            selectedUser.total_balance - Math.abs(amount)
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }

      setModal(null);
      setCreditAmount("");
      setCreditReason("");
      
      if (selectedUser) await fetchUserDetails(selectedUser.id);
      
    } catch (err: any) {
      setError("Failed to process transaction");
      console.error("Error processing credit/debit:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Update wallet balances directly
  const handleUpdateWallet = async (userId: number) => {
    try {
      setActionLoading(true);
      const response = await adminUsersApi.updateUserWallet(userId, {
        available_balance: parseFloat(walletForm.available_balance) || 0,
        invested_balance: parseFloat(walletForm.invested_balance) || 0,
        reason: walletForm.reason || "Admin adjustment"
      });
      
      if (selectedUser) {
        const updatedUser = {
          ...selectedUser,
          wallet_balance: response.new_balances.available_balance,
          invested_balance: response.new_balances.invested_balance,
          total_balance: response.new_balances.total_balance
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }
      
      setModal(null);
      setWalletForm({ available_balance: "", invested_balance: "", reason: "" });
      
    } catch (err: any) {
      setError("Failed to update wallet balances");
      console.error("Error updating wallet:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset wallet balance
  const handleResetWallet = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminUsersApi.resetUserWallet(userId, { reason: "Reset by admin" });
      
      if (selectedUser) {
        const updatedUser = {
          ...selectedUser,
          wallet_balance: 0,
          invested_balance: 0,
          total_balance: 0
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }
      
      if (selectedUser) await fetchUserDetails(selectedUser.id);
      
    } catch (err: any) {
      setError("Failed to reset wallet");
      console.error("Error resetting wallet:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke investment with refund
  const handleRevokeInvestment = async (userId: number, investmentId: number) => {
    try {
      setActionLoading(true);
      const response = await adminUsersApi.revokeInvestment(userId, investmentId);
      
      if (selectedUser && response.refund_amount) {
        const updatedUser = {
          ...selectedUser,
          wallet_balance: selectedUser.wallet_balance + response.refund_amount,
          invested_balance: selectedUser.invested_balance - response.refund_amount,
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }
      
      await fetchUserDetails(userId);
      
    } catch (err: any) {
      setError("Failed to revoke investment");
      console.error("Error revoking investment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke investment WITHOUT refund
  const handleRevokeInvestmentNoRefund = async (userId: number, investmentId: number) => {
    try {
      setActionLoading(true);
      const response = await adminUsersApi.revokeInvestmentWithoutRefund(userId, investmentId, { 
        reason: "Revoked by admin without refund" 
      });
      
      if (selectedUser && response.revoked_amount) {
        const updatedUser = {
          ...selectedUser,
          invested_balance: selectedUser.invested_balance - response.revoked_amount,
          total_balance: selectedUser.total_balance - response.revoked_amount
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }
      
      await fetchUserDetails(userId);
      
    } catch (err: any) {
      setError("Failed to revoke investment without refund");
      console.error("Error revoking investment without refund:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Transfer investment to another user
  const handleTransferInvestment = async (userId: number, investmentId: number) => {
    try {
      setActionLoading(true);
      const response = await adminUsersApi.transferInvestment(userId, investmentId, transferForm);
      
      if (selectedUser && response.transferred_investment) {
        const updatedUser = {
          ...selectedUser,
          invested_balance: selectedUser.invested_balance - response.transferred_investment.current_value,
          total_balance: selectedUser.total_balance - response.transferred_investment.current_value
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }
      
      await fetchUserDetails(userId);
      setModal(null);
      setTransferForm({ target_user_id: "", reason: "" });
      
    } catch (err: any) {
      setError("Failed to transfer investment");
      console.error("Error transferring investment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear portfolio with refund
  const handleClearPortfolio = async (userId: number) => {
    try {
      setActionLoading(true);
      const response = await adminUsersApi.clearUserPortfolio(userId, { reason: "Cleared by admin" });
      
      if (selectedUser && response.total_refund) {
        const updatedUser = {
          ...selectedUser,
          wallet_balance: selectedUser.wallet_balance + response.total_refund,
          invested_balance: 0,
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }
      
      await fetchUserDetails(userId);
      
    } catch (err: any) {
      setError("Failed to clear portfolio");
      console.error("Error clearing portfolio:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear portfolio WITHOUT refund
  const handleClearPortfolioNoRefund = async (userId: number) => {
    try {
      setActionLoading(true);
      const response = await adminUsersApi.clearPortfolioWithoutRefund(userId, { 
        reason: "Cleared by admin without refund" 
      });
      
      if (selectedUser && response.total_value_revoked) {
        const updatedUser = {
          ...selectedUser,
          invested_balance: 0,
          total_balance: selectedUser.total_balance - response.total_value_revoked
        };
        
        updateUsersState(updatedUser);
        setSelectedUser(updatedUser);
      }
      
      await fetchUserDetails(userId);
      
    } catch (err: any) {
      setError("Failed to clear portfolio without refund");
      console.error("Error clearing portfolio without refund:", err);
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
    fetchAllUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#222629] text-white">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-[#222629] border-b border-gray-800 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">User Management</h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Overlay for Mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Users List Sidebar */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0' : 'w-full'}
          ${isTablet ? 'w-96' : 'lg:w-1/3 xl:w-1/4'}
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          bg-[#222629] border-r border-gray-800 flex flex-col h-screen lg:h-auto
        `}>
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user..."
                className="flex-1 text-gray-200 px-3 py-2 rounded-lg focus:outline-none bg-gray-800 text-sm placeholder-gray-400"
              />
              <button
                onClick={() => fetchUsers()}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex-shrink-0"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-gray-400 text-sm">
              <div>{filteredUsers.length} users</div>
              {loading && <div className="text-blue-400">Loading...</div>}
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-2 flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="flex-shrink-0 hover:bg-red-800/50 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => selectUser(user)}
                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                  selectedUser?.id === user.id 
                    ? "bg-blue-600/20 border border-blue-500/50 shadow-lg" 
                    : "bg-gray-900 hover:bg-gray-800 border border-transparent hover:border-gray-700"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {user.name.split(" ").map((s) => s[0]).slice(0,2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-sm">{user.name}</div>
                      <div className="text-xs text-gray-300 truncate">{user.email}</div>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      user.is_email_verified ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
                    }`}>
                      {user.is_email_verified ? "Verified" : "Unverified"}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      user.status === 'active' ? 'bg-green-900/50 text-green-300' : 
                      user.status === 'suspended' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400 p-8 text-center">
              <User className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No User Selected</h3>
              <p className="text-sm max-w-sm">
                Select a user from the list to view and manage their account details, investments, and wallet balances.
              </p>
            </div>
          ) : (
            <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
              {/* Header Section - Responsive */}
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <div className="text-xl sm:text-2xl text-gray-400 font-semibold">
                      {selectedUser.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">{selectedUser.name}</h2>
                    <p className="text-gray-400 truncate text-sm sm:text-base">{selectedUser.email}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">ID: {selectedUser.id}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button 
                        onClick={() => setModal("editProfile")} 
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        disabled={actionLoading}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </button>
                      <button 
                        onClick={() => { setModal("password"); setNewPassword({ password: "", password_confirmation: "" }); }} 
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        disabled={actionLoading}
                      >
                        <Key className="w-4 h-4" />
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[400px]">
                  <div className="bg-gray-900 p-4 rounded-lg text-sm border border-gray-800">
                    <div className="text-gray-400 flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" />
                      Balance
                    </div>
                    <div className="text-lg font-semibold mb-3">
                      ${selectedUser.total_balance.toFixed(2)}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => { setModal("credit"); setCreditAmount(""); setCreditReason(""); }}
                        className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center gap-2 text-sm flex-1 transition-colors"
                        disabled={actionLoading}
                      >
                        <Wallet className="w-4 h-4" />
                        Credit/Debit
                      </button>
                      <button
                        onClick={() => { setModal("editWallet"); setWalletForm({ 
                          available_balance: selectedUser.wallet_balance.toString(), 
                          invested_balance: selectedUser.invested_balance.toString(),
                          reason: ""
                        }); }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center gap-2 text-sm flex-1 transition-colors"
                        disabled={actionLoading}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-4 rounded-lg text-sm border border-gray-800">
                    <div className="text-gray-400 flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4" />
                      Verification
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => handleVerifyEmail(selectedUser.id, true)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm flex-1 text-center min-w-[120px] transition-colors"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "..." : (selectedUser.is_email_verified ? "Re-verify" : "Verify Email")}
                      </button>
                      <button 
                        onClick={() => handleVerifyEmail(selectedUser.id, false)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm flex-1 text-center min-w-[120px] transition-colors"
                        disabled={actionLoading || !selectedUser.is_email_verified}
                      >
                        {actionLoading ? "..." : "Unverify"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-900 p-4 rounded-lg text-sm border border-gray-800">
                  <div className="text-gray-400 flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" />
                    User ID
                  </div>
                  <div className="font-medium text-sm">{selectedUser.id}</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-sm border border-gray-800">
                  <div className="text-gray-400 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Last Login
                  </div>
                  <div className="font-medium text-sm">{selectedUser.last_login}</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-sm border border-gray-800">
                  <div className="text-gray-400 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Registered
                  </div>
                  <div className="font-medium text-sm">{selectedUser.registered}</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-sm border border-gray-800">
                  <div className="text-gray-400 flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4" />
                    Status
                  </div>
                  <div className="font-medium flex items-center gap-2">
                    <span className="text-sm">{selectedUser.status}</span>
                    <select 
                      value={selectedUser.status} 
                      onChange={(e) => handleUpdateStatus(selectedUser.id, e.target.value)}
                      className="bg-gray-800 text-white text-xs p-1 rounded flex-1 max-w-[100px] border border-gray-700"
                      disabled={actionLoading}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Balance Breakdown - Responsive */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Balance Breakdown
                  </h4>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => { setModal("editWallet"); setWalletForm({ 
                        available_balance: selectedUser.wallet_balance.toString(), 
                        invested_balance: selectedUser.invested_balance.toString(),
                        reason: ""
                      }); }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm flex items-center gap-2 flex-1 sm:flex-none justify-center transition-colors"
                      disabled={actionLoading}
                    >
                      <Edit className="w-4 h-4" />
                      Edit Balances
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-sm mb-2">Available Balance</div>
                    <div className="text-lg font-semibold text-green-400">${selectedUser.wallet_balance.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-sm mb-2">Invested Balance</div>
                    <div className="text-lg font-semibold text-blue-400">${selectedUser.invested_balance.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-gray-400 text-sm mb-2">Total Balance</div>
                    <div className="text-lg font-semibold">${selectedUser.total_balance.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Investments Section - Responsive */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Investments
                    <span className="text-sm text-gray-400 font-normal ml-2">
                      ({userInvestments.length})
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleClearPortfolio(selectedUser.id)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm flex items-center gap-2 flex-1 sm:flex-none justify-center transition-colors"
                      disabled={actionLoading || userInvestments.length === 0}
                    >
                      <Trash2 className="w-4 h-4" />
                      {actionLoading ? "..." : "Clear (Refund)"}
                    </button>
                    <button 
                      onClick={() => handleClearPortfolioNoRefund(selectedUser.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm flex items-center gap-2 flex-1 sm:flex-none justify-center transition-colors"
                      disabled={actionLoading || userInvestments.length === 0}
                    >
                      <Trash2 className="w-4 h-4" />
                      {actionLoading ? "..." : "Clear (No Refund)"}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  {userInvestments.length > 0 ? (
                    <div className="space-y-3">
                      {userInvestments.map((investment) => {
                        const currentValue = typeof investment.current_value === 'string' 
                          ? parseFloat(investment.current_value) 
                          : investment.current_value;
                        
                        return (
                          <div key={investment.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm sm:text-base mb-1 truncate">
                                {investment.asset?.title || 'Unknown Asset'}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                                <div>Quantity: {investment.quantity} • Purchase: ${investment.purchase_price}</div>
                                <div>Current: ${investment.current_price} • Value: <span className="font-semibold text-white">${currentValue.toFixed(2)}</span></div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                              <button 
                                onClick={() => handleRevokeInvestment(selectedUser.id, investment.id)}
                                className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm flex items-center gap-2 flex-1 sm:flex-none justify-center min-w-[100px] transition-colors"
                                disabled={actionLoading}
                              >
                                <Trash2 className="w-3 h-3" />
                                Revoke
                              </button>
                              <button 
                                onClick={() => handleRevokeInvestmentNoRefund(selectedUser.id, investment.id)}
                                className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm flex items-center gap-2 flex-1 sm:flex-none justify-center min-w-[100px] transition-colors"
                                disabled={actionLoading}
                              >
                                <Trash2 className="w-3 h-3" />
                                No Refund
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-right text-sm text-gray-400 pt-2 border-t border-gray-700">
                        Total Investments: ${userInvestments.reduce((sum, inv) => {
                          const value = typeof inv.current_value === 'string' 
                            ? parseFloat(inv.current_value) 
                            : inv.current_value;
                          return sum + value;
                        }, 0).toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <div>No investments found</div>
                      <div className="text-sm mt-1">This user hasn't made any investments yet.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics - Responsive */}
              {userDetails?.statistics && (
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    User Statistics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-gray-400 text-sm mb-2">Total Deposits</div>
                      <div className="text-lg font-semibold">${userDetails.statistics.financial?.total_deposits?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-gray-400 text-sm mb-2">Total Withdrawals</div>
                      <div className="text-lg font-semibold">${userDetails.statistics.financial?.total_withdrawals?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-gray-400 text-sm mb-2">Total Orders</div>
                      <div className="text-lg font-semibold">{userDetails.statistics.activity?.total_orders || 0}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-gray-400 text-sm mb-2">Portfolio Items</div>
                      <div className="text-lg font-semibold">{userDetails.statistics.activity?.portfolio_items || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals - Responsive */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto border border-gray-700">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900">
              <div className="text-lg font-semibold truncate">
                {modal === "password" && "Set New Password"}
                {modal === "credit" && "Credit / Debit Wallet"}
                {modal === "editProfile" && "Edit Profile"}
                {modal === "editWallet" && "Edit Wallet Balances"}
                {modal === "transferInvestment" && "Transfer Investment"}
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-gray-800 flex-shrink-0 transition-colors" disabled={actionLoading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {/* PASSWORD MODAL */}
              {modal === "password" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-4">Set a new password for <strong>{selectedUser.name}</strong>.</p>
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={newPassword.password} 
                        onChange={(e) => setNewPassword({...newPassword, password: e.target.value})} 
                        placeholder="New password" 
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors pr-10" 
                        disabled={actionLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={newPassword.password_confirmation} 
                        onChange={(e) => setNewPassword({...newPassword, password_confirmation: e.target.value})} 
                        placeholder="Confirm password" 
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors pr-10" 
                        disabled={actionLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <button onClick={() => setModal(null)} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-1" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleResetPassword(selectedUser.id)} 
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 justify-center transition-colors flex-1"
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
                  <p className="text-sm text-gray-300 mb-4">Enter amount to credit (positive) or debit (negative) the user's wallet.</p>
                  <div className="space-y-4">
                    <input 
                      type="number"
                      step="0.01"
                      value={creditAmount} 
                      onChange={(e) => setCreditAmount(e.target.value)} 
                      placeholder="e.g. 100 or -50" 
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                      disabled={actionLoading}
                    />
                    <input 
                      value={creditReason} 
                      onChange={(e) => setCreditReason(e.target.value)} 
                      placeholder="Reason for transaction" 
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <button onClick={() => setModal(null)} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-1" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleCreditDebit(selectedUser.id)} 
                      className="px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors flex-1"
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
                  <div className="space-y-4">
                    <input 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                      placeholder="Full name" 
                      disabled={actionLoading}
                    />
                    <input 
                      value={profileForm.email} 
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} 
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                      placeholder="Email" 
                      disabled={actionLoading}
                    />
                    <input 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                      placeholder="Phone" 
                      disabled={actionLoading}
                    />
                    <select 
                      value={profileForm.status} 
                      onChange={(e) => setProfileForm({...profileForm, status: e.target.value})} 
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                      disabled={actionLoading}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select 
                      value={profileForm.role} 
                      onChange={(e) => setProfileForm({...profileForm, role: e.target.value})} 
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                      disabled={actionLoading}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <button onClick={() => setModal(null)} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-1" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleUpdateProfile(selectedUser.id)} 
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex-1"
                      disabled={actionLoading}
                    >
                      {actionLoading ? "..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}

              {/* EDIT WALLET MODAL */}
              {modal === "editWallet" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-4">Directly edit wallet balances for <strong>{selectedUser.name}</strong>.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Available Balance</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={walletForm.available_balance} 
                        onChange={(e) => setWalletForm({...walletForm, available_balance: e.target.value})} 
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                        disabled={actionLoading}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Invested Balance</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={walletForm.invested_balance} 
                        onChange={(e) => setWalletForm({...walletForm, invested_balance: e.target.value})} 
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                        disabled={actionLoading}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Reason for Adjustment</label>
                      <input 
                        value={walletForm.reason} 
                        onChange={(e) => setWalletForm({...walletForm, reason: e.target.value})} 
                        placeholder="Reason for balance adjustment"
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <button onClick={() => setModal(null)} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-1" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleUpdateWallet(selectedUser.id)} 
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex-1"
                      disabled={actionLoading || !walletForm.reason}
                    >
                      {actionLoading ? "..." : "Update Balances"}
                    </button>
                  </div>
                </>
              )}

              {/* TRANSFER INVESTMENT MODAL */}
              {modal === "transferInvestment" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-4">Transfer investment to another user.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Target User</label>
                      <select 
                        value={transferForm.target_user_id} 
                        onChange={(e) => setTransferForm({...transferForm, target_user_id: e.target.value})} 
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                        disabled={actionLoading}
                      >
                        <option value="">Select a user</option>
                        {allUsers
                          .filter(user => user.id !== selectedUser.id)
                          .map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Reason for Transfer</label>
                      <input 
                        value={transferForm.reason} 
                        onChange={(e) => setTransferForm({...transferForm, reason: e.target.value})} 
                        placeholder="Reason for transfer"
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors" 
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <button onClick={() => setModal(null)} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-1" disabled={actionLoading}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleTransferInvestment(selectedUser.id, (window as any).currentInvestmentId)} 
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 justify-center transition-colors flex-1"
                      disabled={actionLoading || !transferForm.target_user_id || !transferForm.reason}
                    >
                      {actionLoading ? "..." : "Transfer Investment"}
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