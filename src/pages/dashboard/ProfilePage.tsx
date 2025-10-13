import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { clearCredentials, updateUser } from "../../slices/userSlice";
import { useNavigate } from "react-router-dom";
import { profileApi, Profile, Verification } from "../../api/profile";

// Modal Components
import EditProfileModal from "../../components/modals/EditProfileModal";
import ContactInfoModal from "../../components/modals/ContactInfoModal";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import UploadIdModal from "../../components/modals/UploadIdModal";
import TwoFAModal from "../../components/modals/TwoFAModal";
import DeleteAccountModal from "../../components/modals/DeleteAccountModal";
import VerificationStatusModal from "../../components/modals/VerificationStatusModal";

export default function ProfilePage() {
  const [enabled, setEnabled] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUploadId, setShowUploadId] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showVerificationStatus, setShowVerificationStatus] = useState(false);
  
  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.user.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await profileApi.getProfile();
      setProfile(profileData.user);
      setEnabled(profileData.user.twofa_enabled);
      
      // Fetch verification status
      const verificationData = await profileApi.getVerificationStatus();
      setVerification(verificationData.verification);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/");
  };

  const handleToggle2FA = async () => {
    if (enabled) {
      // If disabling, show disable modal
      setShowTwoFA(true);
    } else {
      // If enabling, generate secret and show setup modal
      try {
        await profileApi.generateTwoFactorSecret();
        setShowTwoFA(true);
      } catch (error) {
        console.error("Error generating 2FA secret:", error);
      }
    }
  };

  const handle2FASuccess = () => {
    setEnabled(!enabled);
    setShowTwoFA(false);
    fetchProfileData(); // Refresh profile data
  };

  const handleProfileUpdate = (updatedUser: Profile) => {
    setProfile(updatedUser);
    dispatch(updateUser(updatedUser));
  };

  const handleVerificationSubmit = () => {
    setShowUploadId(false);
    fetchProfileData(); // Refresh verification status
  };

  const handleAccountDelete = () => {
    setShowDeleteAccount(false);
    handleLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-purple-400 flex items-center justify-center text-white text-3xl font-bold mx-auto">
          {profile?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">
          {profile?.name || 'User'}
        </h2>
        <p className="text-gray-400 mt-1">{profile?.email}</p>
        <button className="bg-blue-900 text-white text-xs px-4 py-1 rounded-full mt-2">
          {profile?.role || 'USER'}
        </button>
        
        {/* Verification Status Badge */}
        {verification && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              verification.status === 'approved' ? 'bg-green-500' :
              verification.status === 'pending' ? 'bg-yellow-500' :
              'bg-red-500'
            } text-white`}>
              ID {verification.status.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Settings Sections */}
      <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-3xl w-full">
        {/* Personal Details */}
        <div className="bg-[#222629] shadow rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            PERSONAL DETAILS
          </h3>
          <ul className="space-y-3 text-gray-400">
            <li 
              className="flex items-center gap-2 cursor-pointer hover:underline hover:text-white transition-colors"
              onClick={() => setShowEditProfile(true)}
            >
              ✏️ Edit Profile
            </li>
            <li 
              className="flex items-center gap-2 cursor-pointer hover:underline hover:text-white transition-colors"
              onClick={() => setShowVerificationStatus(true)}
            >
              ✅ Account Verification
            </li>
            <li 
              className="flex items-center gap-2 cursor-pointer hover:underline hover:text-white transition-colors"
              onClick={() => setShowContactInfo(true)}
            >
              📱 Update contact info
            </li>
          </ul>
        </div>

        {/* Security */}
        <div className="bg-[#222629] shadow rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">SECURITY</h3>
          <ul className="space-y-3 text-gray-400">
            <li 
              className="flex items-center gap-2 cursor-pointer hover:underline hover:text-white transition-colors"
              onClick={() => setShowChangePassword(true)}
            >
              🔒 Change Password
            </li>
            <li 
              className="flex items-center gap-2 cursor-pointer hover:underline hover:text-white transition-colors"
              onClick={() => setShowUploadId(true)}
            >
              📷 Upload new ID
            </li>
          </ul>
        </div>

        {/* Manage Account */}
        <div className="bg-[#222629] shadow rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            MANAGE ACCOUNT
          </h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center justify-between gap-2 cursor-pointer">
              <div 
                className="flex items-center gap-2 hover:underline hover:text-white transition-colors"
                onClick={handleToggle2FA}
              >
                <span>🔒</span>
                <span>Enable/Disable 2FA</span>
              </div>
              {/* Toggle Switch */}
              <div
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  enabled ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={handleToggle2FA}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </li>
            <li 
              className="flex items-center gap-2 hover:underline hover:text-red-400 transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              ↩ Log out
            </li>
          </ul>
        </div>

        {/* Help & Support */}
        <div className="bg-[#222629] shadow rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            HELP & SUPPORT
          </h3>
          <ul className="space-y-3 text-gray-400">
            <li 
              className="flex items-center gap-2 hover:underline hover:text-red-400 transition-colors cursor-pointer"
              onClick={() => setShowDeleteAccount(true)}
            >
              🗑️ Delete Account
            </li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSuccess={handleProfileUpdate}
        currentProfile={profile}
      />

      <ContactInfoModal
        isOpen={showContactInfo}
        onClose={() => setShowContactInfo(false)}
        onSuccess={handleProfileUpdate}
        currentProfile={profile}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <UploadIdModal
        isOpen={showUploadId}
        onClose={() => setShowUploadId(false)}
        onSuccess={handleVerificationSubmit}
      />

      <TwoFAModal
        isOpen={showTwoFA}
        onClose={() => setShowTwoFA(false)}
        onSuccess={handle2FASuccess}
        isEnabled={enabled}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onSuccess={handleAccountDelete}
      />

      <VerificationStatusModal
        isOpen={showVerificationStatus}
        onClose={() => setShowVerificationStatus(false)}
        verification={verification}
        onUploadId={() => {
          setShowVerificationStatus(false);
          setShowUploadId(true);
        }}
      />
    </div>
  );
}