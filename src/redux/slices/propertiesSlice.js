import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";
import { showToast } from "../../utils/toast";

/** List + filter + search (q) */
export const fetchProperties = createAsyncThunk(
  "properties/fetchList",
  async (params, { rejectWithValue }) => {
    try {
      const { page = 0, size = 10, status, q } = params || {};
      const { data } = await axiosInstance.get("/v1/properties", {
        params: {
          page, size,
          ...(status ? { status } : {}),
          ...(status ? { postStatus: status } : {}),
          ...(q ? { q } : {}),
          sort: "createdAt,DESC",
        },
      });
      return data; // { size, sort, totalPages, totalElements, page, content: [...] }
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load properties failed" });
    }
  }
);

/** Detail by id */
export const fetchPropertyById = createAsyncThunk(
  "properties/fetchById",
  async (propertyId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/properties/${propertyId}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load property failed" });
    }
  }
);

/** Delete by id */
export const deleteProperty = createAsyncThunk(
  "properties/delete",
  async (propertyId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/v1/properties/${propertyId}`);
      showToast("success", "Xoá bài đăng thành công");
      return { propertyId };
    } catch (e) {
        showToast("error", "Xoá bài đăng thất bại: " + (e.response?.data?.message || e.message || "Lỗi"));
      return rejectWithValue(e.response?.data || { message: "Delete failed" });
    }
  }
);

/** Update status APPROVED / REJECTED (with optional reason) */
export const updatePropertyStatus = createAsyncThunk(
  "properties/updateStatus",
  async ({ propertyId, status, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/v1/properties/${propertyId}/status`,
        null,
        { params: { status, ...(reason ? { reason } : {}) } }
      );
        showToast("success", "Cập nhật trạng thái thành công");
      // BE có thể trả entity sau-update; nếu không, ta tự build patch từ input
      return data ?? { propertyId, postStatus: status, rejectedReason: reason || null };
    } catch (e) {
        showToast("error", "Cập nhật trạng thái thất bại: " + (e.response?.data?.message || e.message || "Lỗi"));
      return rejectWithValue(e.response?.data || { message: "Update status failed" });
    }
  }
);

const slice = createSlice({
  name: "properties",
  initialState: {
    items: [],
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    status: "",   // '', 'PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'
    q: "",

    loading: false,
    error: null,

    // detail drawer
    detail: null,
    detailLoading: false,

    // inline action flags
    actionLoadingId: null,
  },
  reducers: {
    setStatus(state, { payload }) { state.status = payload; state.page = 0; },
    setQ(state, { payload }) { state.q = payload; state.page = 0; },
    setPage(state, { payload }) { state.page = payload; },
    setSize(state, { payload }) { state.size = payload; state.page = 0; },
    clearError(state) { state.error = null; },
    clearDetail(state) { state.detail = null; },
  },
  extraReducers: (b) => {
    // list
    b.addCase(fetchProperties.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchProperties.fulfilled, (s, { payload }) => {
      s.loading = false;
      s.items = payload?.content || [];
      s.page = payload?.page ?? 0;
      s.size = payload?.size ?? s.size;
      s.totalPages = payload?.totalPages ?? 0;
      s.totalElements = payload?.totalElements ?? 0;
    });
    b.addCase(fetchProperties.rejected, (s, { payload }) => {
      s.loading = false;
      s.error = payload?.message || "Load properties failed";
    });

    // detail
    b.addCase(fetchPropertyById.pending, (s) => { s.detailLoading = true; s.error = null; });
    b.addCase(fetchPropertyById.fulfilled, (s, { payload }) => {
      s.detailLoading = false;
      s.detail = payload;
    });
    b.addCase(fetchPropertyById.rejected, (s, { payload }) => {
      s.detailLoading = false;
      s.error = payload?.message || "Load property failed";
    });

    // delete
    b.addCase(deleteProperty.pending, (s, { meta }) => { s.actionLoadingId = meta.arg; });
    b.addCase(deleteProperty.fulfilled, (s, { payload }) => {
      s.actionLoadingId = null;
      const id = payload.propertyId;
      s.items = s.items.filter(x => x.propertyId !== id);
      s.totalElements = Math.max(0, s.totalElements - 1);
    });
    b.addCase(deleteProperty.rejected, (s, { payload }) => {
      s.actionLoadingId = null;
      s.error = payload?.message || "Delete failed";
    });

    // status
    b.addCase(updatePropertyStatus.pending, (s, { meta }) => { s.actionLoadingId = meta.arg.propertyId; });
    b.addCase(updatePropertyStatus.fulfilled, (s, { payload, meta }) => {
      s.actionLoadingId = null;
      const id = payload?.propertyId || meta.arg.propertyId;
      const idx = s.items.findIndex(x => x.propertyId === id);
      const patch = {
        postStatus: payload?.postStatus ?? meta.arg.status,
        rejectedReason: payload?.rejectedReason ?? (meta.arg.status === "REJECTED" ? (meta.arg.reason || null) : null),
      };
      if (idx >= 0) s.items[idx] = { ...s.items[idx], ...patch };
      if (s.detail && s.detail.propertyId === id) s.detail = { ...s.detail, ...patch };
    });
    b.addCase(updatePropertyStatus.rejected, (s, { payload }) => {
      s.actionLoadingId = null;
      s.error = payload?.message || "Update status failed";
    });
  },
});

export const {
  setStatus, setQ, setPage, setSize, clearError, clearDetail
} = slice.actions;
export default slice.reducer;
