import React, { useState, useEffect } from "react";
import { X, ArrowLeft, Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";

export default function NotificationsDrawer({ open, onClose }) {
  const [view, setView] = useState("list");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  
  const {
    notifications,
    loading: contextLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (open) {
      setInternalLoading(true);
      fetchNotifications().finally(() => {
        setInternalLoading(false);
      });
    }
  }, [open]); // Remove fetchNotifications from dependencies

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setView("details");
    
    // Mark as read if unread
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
  };

  const resetAndClose = () => {
    setView("list");
    setSelectedNotification(null);
    onClose();
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      older: [],
    };

    notifications.forEach(notification => {
      if (!notification || !notification.created_at) return;
      
      const notificationDate = new Date(notification.created_at);
      
      if (notificationDate.toDateString() === today.toDateString()) {
        groups.today.push(notification);
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return "Today";
      } else if (diffDays === 2) {
        return "Yesterday";
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return "Invalid date";
    }
  };

  const hasUnreadNotifications = notifications.some(notif => !notif.read_at);
  const isLoading = internalLoading || contextLoading;

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
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#1a1d21]">
          <div className="flex items-center gap-2">
            {view === "details" && (
              <button 
                onClick={() => setView("list")}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">
              {view === "list" ? "Notifications" : "Notification Details"}
            </h2>
          </div>

          <button 
            onClick={resetAndClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-full">
          {view === "list" ? (
            // ---------------- Notifications List ----------------
            <div className="w-full">
              {/* Header with mark all as read */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Bell className="w-5 h-5" />
                  <span>
                    {hasUnreadNotifications 
                      ? `${notifications.filter(n => !n.read_at).length} unread notification${notifications.filter(n => !n.read_at).length !== 1 ? 's' : ''}`
                      : "No unread notifications"
                    }
                  </span>
                </div>
                {hasUnreadNotifications && !isLoading && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-blue-400 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-400 hover:text-white transition-colors"
                  >
                    MARK ALL AS READ
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-400">Loading notifications...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center py-8">
                  <div className="text-red-400 text-center">
                    <p>{error}</p>
                    <button 
                      onClick={fetchNotifications}
                      className="text-blue-400 mt-2 hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No notifications yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    You'll see important updates here
                  </p>
                </div>
              ) : (
                // Notification groups
                <div className="space-y-6 text-sm">
                  {(() => {
                    const groups = groupNotificationsByDate();
                    return (
                      <>
                        {groups.today.length > 0 && (
                          <div>
                            <h2 className="font-semibold text-gray-400 uppercase text-xs mb-3">
                              Today ({groups.today.length})
                            </h2>
                            <div className="space-y-2">
                              {groups.today.map(notification => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onClick={handleNotificationClick}
                                  onMarkAsRead={markAsRead}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groups.yesterday.length > 0 && (
                          <div>
                            <h2 className="font-semibold text-gray-400 uppercase text-xs mb-3">
                              Yesterday ({groups.yesterday.length})
                            </h2>
                            <div className="space-y-2">
                              {groups.yesterday.map(notification => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onClick={handleNotificationClick}
                                  onMarkAsRead={markAsRead}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groups.older.length > 0 && (
                          <div>
                            <h2 className="font-semibold text-gray-400 uppercase text-xs mb-3">
                              Older ({groups.older.length})
                            </h2>
                            <div className="space-y-2">
                              {groups.older.map(notification => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onClick={handleNotificationClick}
                                  onMarkAsRead={markAsRead}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            // ---------------- Notification Details ----------------
            selectedNotification && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedNotification.title}
                  </h3>
                  {!selectedNotification.read_at && (
                    <button
                      onClick={() => markAsRead(selectedNotification.id)}
                      className="flex items-center gap-1 text-blue-400 text-sm hover:underline"
                    >
                      <Check className="w-4 h-4" />
                      Mark as read
                    </button>
                  )}
                </div>
                
                <div className="text-gray-400 text-sm">
                  {formatDate(selectedNotification.created_at)}
                  {selectedNotification.read_at && (
                    <span className="ml-2 text-green-400 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" />
                      Read
                    </span>
                  )}
                </div>
                
                <div className="bg-[#1a1d21] rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>
                
                <div className="text-gray-500 text-xs">
                  Received: {selectedNotification.created_at ? new Date(selectedNotification.created_at).toLocaleString() : 'Unknown date'}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

// Notification Item Component
const NotificationItem = React.memo(({ 
  notification, 
  onClick, 
  onMarkAsRead 
}) => {
  const isUnread = !notification.read_at;

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isUnread 
          ? "bg-gray-400 bg-opacity-10 border border-blue-500 border-opacity-20" 
          : "bg-[#1a1d21] hover:bg-gray-800"
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${
            isUnread ? "text-white" : "text-gray-300"
          }`}>
            {notification.title || "No Title"}
          </h4>
          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
            {notification.message || "No message"}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-500 text-xs">
              {notification.created_at ? new Date(notification.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'Unknown time'}
            </span>
            {isUnread && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="text-green-800 hover:text-blue-300 text-xs flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark read
              </button>
            )}
          </div>
        </div>
        {isUnread && (
          <div className="w-2 h-2 bg-green-500 rounded-full ml-2 mt-1 flex-shrink-0" />
        )}
      </div>
    </div>
  );
});