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

/** Revenue summary */
export const fetchRevenueSummary = createAsyncThunk(
  "stats/revenueSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/admin/stats/revenue/summary", { params });
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load revenue failed" });
    }
  }
);

/** Property/post summary */
export const fetchPostSummary = createAsyncThunk(
  "stats/postSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/admin/stats/posts/summary", { params });
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load properties failed" });
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
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
    },
    revenueSummary: {
      period: "MONTH",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: null,
      totalRevenue: 0,
      dailyBreakdown: [],
      monthlyBreakdown: [],
    },
    postSummary: {
      period: "MONTH",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: null,
      totalPosts: 0,
      dailyBreakdown: [],
      monthlyBreakdown: [],
    },
    revenueLoading: false,
    postLoading: false,
    recentBookings: [],   // [{ bookingId, ... }]
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchOverview.pending, (s)=>{ s.loading = true; s.error = null; });
    b.addCase(fetchOverview.fulfilled, (s,{payload})=>{ s.loading = false; s.overview = { ...s.overview, ...payload }; });
    b.addCase(fetchOverview.rejected, (s,{payload})=>{ s.loading = false; s.error = payload?.message || "Load overview failed"; });

    b.addCase(fetchRevenueSummary.pending, (s)=>{ s.revenueLoading = true; });
    b.addCase(fetchRevenueSummary.fulfilled, (s,{payload})=>{
      s.revenueLoading = false;
      s.revenueSummary = payload || s.revenueSummary;
    });
    b.addCase(fetchRevenueSummary.rejected, (s,{payload})=>{
      s.revenueLoading = false;
      s.error = payload?.message || "Load revenue failed";
    });
    b.addCase(fetchPostSummary.pending, (s)=>{ s.postLoading = true; });
    b.addCase(fetchPostSummary.fulfilled, (s,{payload})=>{
      s.postLoading = false;
      s.postSummary = payload || s.postSummary;
    });
    b.addCase(fetchPostSummary.rejected, (s,{payload})=>{
      s.postLoading = false;
      s.error = payload?.message || "Load properties failed";
    });
    b.addCase(fetchRecentBookings.fulfilled, (s,{payload})=>{ s.recentBookings = payload; });
  },
});

export default slice.reducer;
