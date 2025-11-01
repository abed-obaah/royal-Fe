import api from "../services/axios";

export interface UserNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  read_at: string | null;
  created_at: string;
}

export interface SendNotificationRequest {
  title: string;
  message: string;
  type: string;
  priority: string;
  user_type?: string;
  action_url?: string;
}

export const adminNotificationsApi = {
  getUserNotifications: async (userId: number) => {
    const response = await api.get(`/admin/users/${userId}/notifications`);
    return response.data;
  },
  
  sendToUser: async (data: any) => {
    const response = await api.post("/admin/notifications/send/user", data);
    return response.data;
  },
  
  sendToMultiple: async (data: any) => {
    const response = await api.post("/admin/notifications/send/multiple", data);
    return response.data;
  },
  
  sendToAll: async (data: any) => {
    const response = await api.post("/admin/notifications/send/all", data);
    return response.data;
  },
  
  markAllUserNotificationsAsRead: async (userId: number) => {
    const response = await api.put(`/admin/users/${userId}/notifications/mark-all-read`);
    return response.data;
  },
  
  deleteUserNotification: async (userId: number, notificationId: number) => {
    const response = await api.delete(`/admin/users/${userId}/notifications/${notificationId}`);
    return response.data;
  }
};