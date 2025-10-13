import api from "../services/axios";

// -------------------- Notification Types --------------------
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  data?: any; // Your backend has this field
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// Your backend returns an array directly, not wrapped in a "notifications" object
export type NotificationsResponse = Notification[];

export interface MarkAsReadResponse {
  message: string;
}

export interface MarkAllAsReadResponse {
  message: string;
}

// -------------------- Notification API Calls --------------------
export const notificationsApi = {
  // Get all notifications for authenticated user
  getNotifications: async (): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>("/notifications");
    return response.data || []; // Your backend returns array directly
  },

  // Mark a single notification as read
  markAsRead: async (notificationId: number): Promise<MarkAsReadResponse> => {
    const response = await api.put<MarkAsReadResponse>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await api.put<MarkAllAsReadResponse>("/notifications/read-all");
    return response.data;
  },
};