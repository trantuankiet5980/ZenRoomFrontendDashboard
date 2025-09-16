import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/notifications");
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load notifications failed" });
    }
  }
);

// Đánh dấu 1 thông báo đã đọc
export const markOneRead = createAsyncThunk(
  "notifications/markOneRead",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/v1/notifications/${id}/read`);
      // kỳ vọng { updated, unreadCount }
      return { id, unreadCount: data?.unreadCount ?? undefined };
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Đánh dấu đã đọc thất bại" });
    }
  }
);

// Đánh dấu đã đọc tất cả
export const markAllReadServer = createAsyncThunk(
  "notifications/markAllReadServer",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/v1/notifications/read-all`);
      // kỳ vọng { updated, unreadCount: 0 }
      return { unreadCount: data?.unreadCount ?? 0 };
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Đánh dấu tất cả thất bại" });
    }
  }
);


const slice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    connected: false,
  },
  reducers: {
    wsConnected(state) { state.connected = true; },
    wsDisconnected(state) { state.connected = false; },
    wsUpsert(state, { payload }) {
      const incoming = Array.isArray(payload) ? payload : [payload];
      for (const n of incoming) {
        const i = state.items.findIndex(x => x.notificationId === n.notificationId);
        if (i === -1) {
          state.items.unshift(n);
          if (!n.isRead) state.unreadCount += 1;
        } else {
          const prevUnread = !state.items[i].isRead;
          const nextUnread = !n.isRead;
          state.items[i] = { ...state.items[i], ...n };
          // điều chỉnh lại unreadCount nếu trạng thái đọc thay đổi
          if (prevUnread && !nextUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
          if (!prevUnread && nextUnread) state.unreadCount += 1;
        }
      }
    },
    markAllRead(state) {
      state.items = state.items.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
  },
  extraReducers: b => {
    b.addCase(fetchNotifications.pending, s => { s.loading = true; s.error = null; });
    b.addCase(fetchNotifications.fulfilled, (s, { payload }) => {
      s.loading = false;
      s.items = payload.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      s.unreadCount = s.items.filter(n => !n.isRead).length;
    });
    b.addCase(fetchNotifications.rejected, (s,{payload}) => {
      s.loading = false;
      s.error = payload?.message || "Load notifications failed";
    });

    // markOneRead
    b.addCase(markOneRead.fulfilled, (s, { payload }) => {
      const { id, unreadCount } = payload || {};
      const i = s.items.findIndex(n => n.notificationId === id);
      if (i !== -1) {
        s.items[i] = { ...s.items[i], isRead: true };
      }
      if (typeof unreadCount === "number") s.unreadCount = unreadCount;
      else s.unreadCount = s.items.filter(n => !n.isRead).length;
    });

    // markAllReadServer
    b.addCase(markAllReadServer.fulfilled, (s, { payload }) => {
      s.items = s.items.map(n => ({ ...n, isRead: true }));
      s.unreadCount = typeof payload?.unreadCount === "number" ? payload.unreadCount : 0;
    });
  }
});

export const { wsConnected, wsDisconnected, wsUpsert, markAllRead } = slice.actions;
export default slice.reducer;
