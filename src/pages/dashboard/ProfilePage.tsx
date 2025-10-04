import React, { useState } from "react";

export default function ProfilePage() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="min-h-screen  p-6 flex flex-col items-center">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-purple-400 flex items-center justify-center text-white text-3xl font-bold mx-auto">
          AO
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">abednego obaah</h2>
        <p className="text-gray-500">@popular</p>
        <button className="bg-blue-900 text-white text-xs px-4 py-1 rounded-full mt-2">
          INDIVIDUAL
        </button>
      </div>

      {/* Settings Sections */}
      <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-3xl w-full">
        {/* Personal Details */}
        <div className="bg-[#222629] shadow rounded-xl p-6 ">
          <h3 className="text-sm font-semibold text-white mb-4">
            PERSONAL DETAILS
          </h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
               Edit Profile
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
             Account Verification
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
              Update contact info
            </li>
          </ul>
        </div>

        {/* Security */}
        <div className="bg-[#222629] shadow rounded-xl p-6 ">
          <h3 className="text-sm font-semibold text-white mb-4">SECURITY</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
              Change Password
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
               Upload new ID
            </li>
          </ul>
        </div>

        {/* Account Settings */}

        {/* Manage Account */}
        <div className="bg-[#222629] shadow rounded-xl p-6 ">
          <h3 className="text-sm font-semibold text-white mb-4">
            MANAGE ACCOUNT
          </h3>
          <ul className="space-y-3 text-gray-400">
             <li
      className="flex items-center justify-between gap-2 cursor-pointer"
      onClick={() => setEnabled(!enabled)}
    >
      <div className="flex items-center gap-2">
        {/* <span>🔒</span> */}
        <span className="hover:underline">Enable/Disable 2FA</span>
      </div>

      {/* Toggle Switch */}
      <div
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          enabled ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </li>
            <li className="flex items-center gap-2 hover:underline text-red-500">
              ↩Log out
            </li>
          </ul>
        </div>

        {/* Help & Support */}
        <div className="bg-[#222629] shadow rounded-xl p-6 ">
          <h3 className="text-sm font-semibold text-white mb-4">
            HELP & SUPPORT
          </h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2 hover:underline text-red-500"> Delete Account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
