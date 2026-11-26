import axios from "axios";

const NOTIFY_BASE_URL = (
  import.meta.env.VITE_NOTIFY_API_URL || "http://localhost:5002"
).replace(/\/+$/, "");

export interface NotificationItem {
  id: string;
  eventType: string;
  title: string;
  message: string;
  severity: "info" | "success" | "warning" | "error" | string;
  actionUrl?: string | null;
  unread: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const notifyApi = {
  getStreamUrl: (token: string) =>
    `${NOTIFY_BASE_URL}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`,

  getNotifications: async (limit = 30): Promise<NotificationListResponse> => {
    const res = await axios.get<NotificationListResponse>(
      `${NOTIFY_BASE_URL}/api/v1/notifications`,
      {
        params: { limit },
        headers: authHeaders(),
        timeout: 5000,
      }
    );
    return res.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await axios.patch(
      `${NOTIFY_BASE_URL}/api/v1/notifications/${id}/read`,
      {},
      { headers: authHeaders(), timeout: 5000 }
    );
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.patch(
      `${NOTIFY_BASE_URL}/api/v1/notifications/read-all`,
      {},
      { headers: authHeaders(), timeout: 5000 }
    );
  },
};

export default notifyApi;
