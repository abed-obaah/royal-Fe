import React, { useState } from "react";
import { X, ArrowLeft, Bell } from "lucide-react";

export default function NotificationsDrawer({ open, onClose }) {
  const [view, setView] = useState("list"); // "list" | "details"

  const resetAndClose = () => {
    setView("list");
    onClose();
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
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {view === "details" && (
              <button onClick={() => setView("list")}>
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-black" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {view === "list" ? "Notifications" : "Notification Details"}
            </h2>
          </div>

          <button onClick={resetAndClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {view === "list" ? (
            // ---------------- Notifications List ----------------
            <div className="w-full">
              {/* No unread notifications */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <Bell className="w-5 h-5" />
                  <span>No unread notifications</span>
                </div>
                <button className="text-gray-400 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100">
                  MARK ALL AS READ
                </button>
              </div>

              {/* Notification groups */}
              <div className="space-y-6 text-sm">
                <div>
                  <h2 className="font-semibold text-gray-700 uppercase">
                    Today (0)
                  </h2>
                  <p className="text-gray-400 mt-1">
                    There are no notifications to show here.
                  </p>
                </div>

                <div>
                  <h2 className="font-semibold text-gray-700 uppercase">
                    Yesterday (0)
                  </h2>
                  <p className="text-gray-400 mt-1">
                    There are no notifications to show here.
                  </p>
                </div>

                <div>
                  <h2 className="font-semibold text-gray-700 uppercase">
                    Older (0)
                  </h2>
                  <p className="text-gray-400 mt-1">
                    There are no notifications to show here.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // ---------------- Notification Details ----------------
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Notification Title
              </h3>
              <p className="text-gray-600">
                Here’s where the detailed notification message will appear.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
