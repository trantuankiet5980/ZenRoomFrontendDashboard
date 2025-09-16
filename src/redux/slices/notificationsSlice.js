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
          state.items[i] = { ...state.items[i], ...n };
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
  }
});

export const { wsConnected, wsDisconnected, wsUpsert, markAllRead } = slice.actions;
export default slice.reducer;
