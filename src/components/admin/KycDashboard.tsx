"use client";

import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { CheckCircle, XCircle, Eye } from "lucide-react";

const usersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    kycDocs: {
      idCard: "https://via.placeholder.com/300x200",
      address: "https://via.placeholder.com/300x200",
      selfie: "https://via.placeholder.com/200x200",
    },
    status: "Pending",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    kycDocs: {
      idCard: "https://via.placeholder.com/300x200",
      address: "https://via.placeholder.com/300x200",
      selfie: "https://via.placeholder.com/200x200",
    },
    status: "Verified",
  },
];

export default function KycDashboard() {
  const [users, setUsers] = useState(usersData);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const updateStatus = (id, status) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status } : user
      )
    );
  };

  const handleView = (img) => {
    setSelectedImage(img);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">KYC Verification</h1>

      <div className="bg-gray-900 rounded-xl shadow p-6">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Documents</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="bg-gray-800 hover:bg-gray-700 transition rounded-lg"
              >
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-gray-300">{user.email}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Eye
                    className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer"
                    onClick={() => handleView(user.kycDocs.idCard)}
                  />
                  <Eye
                    className="w-5 h-5 text-green-400 hover:text-green-300 cursor-pointer"
                    onClick={() => handleView(user.kycDocs.address)}
                  />
                  <Eye
                    className="w-5 h-5 text-purple-400 hover:text-purple-300 cursor-pointer"
                    onClick={() => handleView(user.kycDocs.selfie)}
                  />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "Verified"
                        ? "bg-green-900 text-green-300"
                        : user.status === "Rejected"
                        ? "bg-red-900 text-red-300"
                        : "bg-yellow-900 text-yellow-300"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex justify-end gap-2">
                  <button
                    onClick={() => updateStatus(user.id, "Verified")}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(user.id, "Rejected")}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Image Preview */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-gray-900 rounded-lg shadow-lg overflow-hidden max-w-2xl w-full">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="KYC Doc"
                className="w-full h-auto object-contain"
              />
            )}
            <div className="p-4 flex justify-end">
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
    </div>
  );
}
