"use client";

import React, { useState } from "react";
import { Search, MoreVertical, X, Camera, Key, Wallet, Eye, EyeOff } from "lucide-react";

const initialUsers = [
  {
    id: "fxEJwC...",
    name: "Edwige Lepinay",
    email: "Edwige974lepinay@gmail.com",
    currency: "EUR",
    lastLogin: "1 month ago",
    registered: "1 month ago",
    verification: "Unverified",
    status: "Active",
    avatar: "",
    balance: 120.5,
    password: "user1234", // Plain text password
    proofs: [
      "https://via.placeholder.com/600x400?text=ID+Front",
      "https://via.placeholder.com/600x400?text=ID+Back",
      "https://via.placeholder.com/400x400?text=Selfie",
    ],
    assets: [1],
    baskets: [101],
  },
  {
    id: "B2j6lq...",
    name: "Gerald Kupferschmid",
    email: "kcs@forcon.ca",
    currency: "CAD",
    lastLogin: "15 days ago",
    registered: "2 months ago",
    verification: "Verified",
    status: "Active",
    avatar: "",
    balance: 980.0,
    password: "securePass567", // Plain text password
    proofs: ["https://via.placeholder.com/600x400?text=ID+Front"],
    assets: [2],
    baskets: [],
  },
];

const sampleAssets = [
  { id: 1, name: "Song A", type: "Single", price: 100 },
  { id: 2, name: "Song B", type: "Single", price: 150 },
];

const sampleBaskets = [
  { id: 101, name: "Top Hits Basket", price: 500 },
  { id: 102, name: "Indie Picks", price: 300 },
];

export default function UserManagementExtended() {
  const [users, setUsers] = useState(initialUsers);
  const [assets] = useState(sampleAssets);
  const [baskets] = useState(sampleBaskets);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  // modal state
  const [modal, setModal] = useState(null);
  // modal payloads
  const [avatarPreview, setAvatarPreview] = useState("");
  const [profileForm, setProfileForm] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [assignSelection, setAssignSelection] = useState({ assets: [], baskets: [] });
  const [showPassword, setShowPassword] = useState(false); // For password visibility toggle

  // search
  const [q, setQ] = useState("");

  // helper: update user in state
  const updateUser = (id, patch) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  // select user handler — also prepare profile form
  const selectUser = (user) => {
    setSelectedUserId(user.id);
    setProfileForm({
      name: user.name,
      email: user.email,
      currency: user.currency,
      status: user.status,
      verification: user.verification,
    });
    setAvatarPreview(user.avatar || "");
  };

  // delete user
  const handleDeleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setModal(null);
    if (selectedUserId === id) setSelectedUserId(null);
  };

  // reset balance
  const resetBalance = (id) => {
    updateUser(id, { balance: 0 });
  };

  // block/unblock
  const toggleBlock = (id) => {
    const u = users.find((x) => x.id === id);
    updateUser(id, { status: u.status === "Active" ? "Blocked" : "Active" });
  };

  // change password (admin set)
  const handleSetPassword = (id, pwd) => {
    updateUser(id, { password: pwd });
    setNewPassword("");
    setModal(null);
  };

  // credit/debit balance
  const applyCreditDebit = (id, amount) => {
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return;
    const u = users.find((x) => x.id === id);
    updateUser(id, { balance: (u.balance || 0) + numeric });
    setCreditAmount("");
    setModal(null);
  };

  // profile save
  const saveProfile = (id) => {
    updateUser(id, { ...profileForm, avatar: avatarPreview });
    setModal(null);
  };

  // avatar file handle
  const handleAvatarFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  // assign/revoke assets & baskets
  const openAssignModal = (user) => {
    setAssignSelection({ assets: user.assets ?? [], baskets: user.baskets ?? [] });
    setSelectedUserId(user.id);
    setModal("assign");
  };

  const toggleAssign = (type, id) => {
    setAssignSelection((prev) => {
      const list = prev[type].includes(id) ? prev[type].filter((x) => x !== id) : [...prev[type], id];
      return { ...prev, [type]: list };
    });
  };

  const applyAssign = (userId) => {
    updateUser(userId, { assets: assignSelection.assets, baskets: assignSelection.baskets });
    setModal(null);
  };

  // helper filters
  const filteredUsers = users.filter((u) => {
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      u.id.toLowerCase().includes(q.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#222629] text-white">
      {/* Left list */}
      <div className="w-full md:w-1/3 border-r border-gray-800 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search user..."
            className="flex-1 bg-gray-900 text-gray-200 px-3 py-2 rounded-md focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div>{filteredUsers.length} users</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => selectUser(user)}
              className={`p-4 rounded-lg cursor-pointer flex items-center gap-3 ${
                selectedUserId === user.id ? "bg-blue-600" : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-semibold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  user.name.split(" ").map((s) => s[0]).slice(0,2).join("")
                )}
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
                  <span className={`px-2 py-1 rounded ${user.verification === "Verified" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>{user.verification}</span>
                  <span className="px-2 py-1 rounded bg-gray-700 text-gray-300">{user.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right details */}
      <div className="flex-1 p-6">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full text-gray-400">Select a user to manage</div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-800">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">{selectedUser.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <div className="mt-3 flex gap-2 text-sm">
                    <button onClick={() => { setModal("editProfile"); setProfileForm({ ...profileForm }); }} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded">Edit Profile</button>
                    <button onClick={() => { setModal("changeAvatar"); }} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2"><Camera className="w-4 h-4" /> Change Avatar</button>
                    <button onClick={() => { setModal("password"); setNewPassword(""); }} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-2"><Key className="w-4 h-4" /> Reset Password</button>
                  </div>
                </div>
              </div>

              <div className="ml-auto grid grid-cols-1 gap-2 w-full md:w-64">
                <div className="bg-gray-900 p-4 rounded-lg text-sm">
                        <div className="text-gray-400">Balance</div>

                        {/* Balance amount */}
                        <div className="text-lg font-semibold mb-3">
                            {selectedUser.balance?.toFixed(2)} {selectedUser.currency}
                        </div>

                        {/* Buttons aligned under balance */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <button
                            onClick={() => {
                                setModal("credit");
                                setCreditAmount("");
                            }}
                            className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded flex items-center justify-center gap-2 text-sm"
                            >
                            <Wallet className="w-4 h-4" /> Credit/Debit
                            </button>
                            <button
                            onClick={() => resetBalance(selectedUser.id)}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                            >
                            Reset
                            </button>
                        </div>
                        </div>


                <div className="bg-gray-900 p-4 rounded-lg text-sm">
                  <div className="text-gray-400">Verification</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => updateUser(selectedUser.id, { verification: "Verified" })} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm">Mark Verified</button>
                    <button onClick={() => updateUser(selectedUser.id, { verification: "Unverified" })} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm">Mark Unverified</button>
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
                <div className="font-medium">{selectedUser.lastLogin}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg text-sm">
                <div className="text-gray-400">Registered</div>
                <div className="font-medium">{selectedUser.registered}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg text-sm">
                <div className="text-gray-400">Status</div>
                <div className="font-medium">{selectedUser.status}</div>
              </div>
            </div>

            {/* Password display */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Password</h4>
                  <div className="text-sm text-gray-400">Current password</div>
                </div>
                <button onClick={() => { setModal("password"); setNewPassword(""); }} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-2 text-sm"><Key className="w-4 h-4" /> Reset Password</button>
              </div>
              
              <div className="mt-3 flex items-center gap-2 bg-gray-800 p-3 rounded">
                <div className="flex-1 font-mono text-sm">
                  {showPassword ? selectedUser.password : "••••••••••••••"}
                </div>
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Assets & Baskets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Investments</h3>
                <div className="flex gap-2">
                  <button onClick={() => openAssignModal(selectedUser)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm">Assign / Revoke</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Assets</div>
                  {selectedUser.assets?.length ? (
                    <ul className="space-y-2">
                      {selectedUser.assets.map((aid) => {
                        const a = assets.find((x) => x.id === aid);
                        if (!a) return null;
                        return (
                          <li key={aid} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <div>
                              <div className="font-medium">{a.name}</div>
                              <div className="text-xs text-gray-400">{a.type} • ${a.price}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { /* open asset edit if needed */ }} className="px-2 py-1 bg-yellow-600 rounded text-black text-sm">Edit</button>
                              <button onClick={() => { updateUser(selectedUser.id, { assets: selectedUser.assets.filter(x=>x!==aid) }) }} className="px-2 py-1 bg-red-600 rounded text-sm">Revoke</button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-gray-400 text-sm">No assets assigned</div>
                  )}
                </div>

                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Baskets</div>
                  {selectedUser.baskets?.length ? (
                    <ul className="space-y-2">
                      {selectedUser.baskets.map((bid) => {
                        const b = baskets.find((x) => x.id === bid);
                        if (!b) return null;
                        return (
                          <li key={bid} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <div>
                              <div className="font-medium">{b.name}</div>
                              <div className="text-xs text-gray-400">Price: ${b.price}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { /* open basket edit if needed */ }} className="px-2 py-1 bg-yellow-600 rounded text-black text-sm">Edit</button>
                              <button onClick={() => { updateUser(selectedUser.id, { baskets: selectedUser.baskets.filter(x=>x!==bid) }) }} className="px-2 py-1 bg-red-600 rounded text-sm">Revoke</button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-gray-400 text-sm">No baskets assigned</div>
                  )}
                </div>
              </div>
            </div>

            {/* Proofs & Docs quick open */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Proofs & Documents</h4>
                  <div className="text-sm text-gray-400">Click to preview</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal("docs")} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded">View Docs</button>
                  <button onClick={() => setModal("delete")} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded">Delete User</button>
                </div>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto">
                {selectedUser.proofs?.map((p, i) => (
                  <button key={i} onClick={() => { setModal("preview"); setAvatarPreview(p); }} className="w-20 h-12 rounded overflow-hidden bg-gray-800">
                    <img src={p} alt={`proof-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generic modal layer */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl overflow-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="text-lg font-semibold">
                {modal === "delete" && "Delete User"}
                {modal === "notify" && "Send Notification"}
                {modal === "docs" && "Proofs & Documents"}
                {modal === "preview" && "Preview"}
                {modal === "changeAvatar" && "Change Avatar"}
                {modal === "password" && "Set New Password"}
                {modal === "credit" && "Credit / Debit Wallet"}
                {modal === "editProfile" && "Edit Profile"}
                {modal === "assign" && "Assign / Revoke Assets & Baskets"}
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded hover:bg-gray-800"><X/></button>
            </div>

            <div className="p-6">
              {/* DELETE */}
              {modal === "delete" && selectedUser && (
                <>
                  <p>Are you sure you want to delete <strong>{selectedUser.name}</strong>?</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setModal(null)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
                    <button onClick={() => handleDeleteUser(selectedUser.id)} className="px-3 py-2 bg-red-600 rounded">Delete</button>
                  </div>
                </>
              )}

              {/* PASSWORD */}
              {modal === "password" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-3">Set a new password for <strong>{selectedUser.name}</strong>. This will replace their current password.</p>
                  <input 
                    value={newPassword} 
                    onChange={(e)=>setNewPassword(e.target.value)} 
                    placeholder="New password" 
                    className="w-full p-2 rounded bg-gray-800 mb-3" 
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>setModal(null)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
                    <button onClick={()=>handleSetPassword(selectedUser.id, newPassword)} className="px-3 py-2 bg-indigo-600 rounded">Set Password</button>
                  </div>
                </>
              )}

              {/* AVATAR */}
              {modal === "changeAvatar" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-3">Upload a new avatar (client-side preview).</p>
                  <input type="file" accept="image/*" onChange={(e)=>handleAvatarFile(e.target.files?.[0])} className="mb-4" />
                  {avatarPreview && <img src={avatarPreview} alt="preview" className="w-32 h-32 object-cover rounded mb-4" />}
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>setModal(null)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
                    <button onClick={()=>{ saveProfile(selectedUser.id); }} className="px-3 py-2 bg-blue-600 rounded">Save Avatar</button>
                  </div>
                </>
              )}

              {/* CREDIT / DEBIT */}
              {modal === "credit" && selectedUser && (
                <>
                  <p className="text-sm text-gray-300 mb-3">Enter amount to credit (positive) or debit (negative) the user's wallet.</p>
                  <input value={creditAmount} onChange={(e)=>setCreditAmount(e.target.value)} placeholder="e.g. 100 or -50" className="w-full p-2 rounded bg-gray-800 mb-3" />
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>setModal(null)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
                    <button onClick={()=>applyCreditDebit(selectedUser.id, creditAmount)} className="px-3 py-2 bg-green-600 rounded">Apply</button>
                  </div>
                </>
              )}

              {/* EDIT PROFILE */}
              {modal === "editProfile" && selectedUser && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={profileForm.name} onChange={(e)=>setProfileForm({...profileForm, name: e.target.value})} className="p-2 rounded bg-gray-800" placeholder="Full name" />
                    <input value={profileForm.email} onChange={(e)=>setProfileForm({...profileForm, email: e.target.value})} className="p-2 rounded bg-gray-800" placeholder="Email" />
                    <input value={profileForm.currency} onChange={(e)=>setProfileForm({...profileForm, currency: e.target.value})} className="p-2 rounded bg-gray-800" placeholder="Currency" />
                    <select value={profileForm.status} onChange={(e)=>setProfileForm({...profileForm, status: e.target.value})} className="p-2 rounded bg-gray-800">
                      <option>Active</option>
                      <option>Blocked</option>
                    </select>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={()=>setModal(null)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
                    <button onClick={()=>saveProfile(selectedUser.id)} className="px-3 py-2 bg-blue-600 rounded">Save</button>
                  </div>
                </>
              )}

              {/* ASSIGN / REVOKE */}
              {modal === "assign" && selectedUser && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Assets</h4>
                      <div className="space-y-2">
                        {assets.map((a)=>(
                          <label key={a.id} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                            <input type="checkbox" checked={assignSelection.assets.includes(a.id)} onChange={()=>toggleAssign("assets", a.id)} />
                            <div>
                              <div className="font-medium">{a.name}</div>
                              <div className="text-xs text-gray-400">${a.price}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Baskets</h4>
                      <div className="space-y-2">
                        {baskets.map((b)=>(
                          <label key={b.id} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                            <input type="checkbox" checked={assignSelection.baskets.includes(b.id)} onChange={()=>toggleAssign("baskets", b.id)} />
                            <div>
                              <div className="font-medium">{b.name}</div>
                              <div className="text-xs text-gray-400">${b.price}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={()=>setModal(null)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
                    <button onClick={()=>applyAssign(selectedUser.id)} className="px-3 py-2 bg-blue-600 rounded">Apply</button>
                  </div>
                </>
              )}

              {/* PROOFS / PREVIEW */}
              {(modal === "docs" || modal === "preview") && selectedUser && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedUser.proofs?.map((p, i)=>(
                      <div key={i} className="bg-gray-800 rounded overflow-hidden">
                        <img src={p} alt={`doc-${i}`} className="w-full h-64 object-contain" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* NOTIFICATION */}
              {modal === "notify" && selectedUser && (
                <>
                  <textarea placeholder="Message" className="w-full h-40 p-3 bg-gray-800 rounded mb-4"></textarea>
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>setModal(null)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
                    <button onClick={()=>{ /* send notification */ setModal(null); }} className="px-3 py-2 bg-blue-600 rounded">Send</button>
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