import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

/** Overview (giữ nguyên) */
export const fetchOverview = createAsyncThunk(
  "stats/overview",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/admin/stats/overview");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load overview failed" });
    }
  }
);

/** Revenue: [{ date, revenue }] */
export const fetchRevenue = createAsyncThunk(
  "stats/revenue",
  async ({ days = 30 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/admin/stats/revenue", { params: { days } });
      // Chuẩn hóa đề phòng server trả 1 object đơn lẻ:
      return Array.isArray(data) ? data : (data ? [data] : []);
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load revenue failed" });
    }
  }
);

/** Recent bookings: [{ bookingId, tenantName, propertyTitle, totalPrice, bookingStatus, createdAt }] */
export const fetchRecentBookings = createAsyncThunk(
  "stats/recentBookings",
  async ({ limit = 8 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/admin/bookings/recent", { params: { limit } });
      return Array.isArray(data) ? data : (data ? [data] : []);
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load recent bookings failed" });
    }
  }
);

const slice = createSlice({
  name: "stats",
  initialState: {
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      landlords: 0,
      tenants: 0,
      totalProperties: 0,
      approvedProperties: 0,
      pendingProperties: 0,
      totalBookings: 0,
      pendingBookings: 0,
      approvedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      revenueLast30Days: 0,
    },
    revenue: [],          // [{ date, revenue }]
    recentBookings: [],   // [{ bookingId, ... }]
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchOverview.pending, (s)=>{ s.loading = true; s.error = null; });
    b.addCase(fetchOverview.fulfilled, (s,{payload})=>{ s.loading = false; s.overview = { ...s.overview, ...payload }; });
    b.addCase(fetchOverview.rejected, (s,{payload})=>{ s.loading = false; s.error = payload?.message || "Load overview failed"; });

    b.addCase(fetchRevenue.fulfilled, (s,{payload})=>{ s.revenue = payload; });
    b.addCase(fetchRecentBookings.fulfilled, (s,{payload})=>{ s.recentBookings = payload; });
  },
});

export default slice.reducer;
