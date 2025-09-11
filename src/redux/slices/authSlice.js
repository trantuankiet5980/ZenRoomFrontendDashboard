import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";
import { showToast } from "../../utils/toast";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/auth/login", { phoneNumber, password });
      // { success, message, token, role, userId, fullName, expiresAt }
      if (!data?.token) throw new Error(data?.message || "No token");
      return data;
    } catch (err) {
      return rejectWithValue({ message: err?.response?.data?.message || "Login failed" });
    }
  }
);

const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  role: null, userId: null, fullName: null,
  expiresAt: localStorage.getItem("expiresAt") || null,
  isLoading: false, error: null,
};

let logoutTimerId = null;
// 👉 util nội bộ: lên lịch auto-logout theo expiresAt (ms)
export function setupAutoLogout(dispatch, expiresAt) {
  if (logoutTimerId) clearTimeout(logoutTimerId);
  if (!expiresAt) return;
  const delay = Math.max(0, Number(expiresAt) - Date.now());
  logoutTimerId = setTimeout(() => {
    dispatch(logout());
    showToast("info", "Phiên đăng nhập đã hết, vui lòng đăng nhập lại.");
  }, delay);
}

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.role = null;
      state.userId = null;
      state.fullName = null;
      state.expiresAt = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("expiresAt");
      // không navigate ở reducer; ProtectedRoute sẽ tự đẩy về /login
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => { s.isLoading = true; s.error = null; });
    b.addCase(loginThunk.fulfilled, (s, { payload }) => {
      s.isLoading = false;
      if (payload.role !== "admin") {
          s.error = "Bạn không có quyền truy cập trang quản trị.";
          return;
        }
      s.accessToken = payload.token;
      s.role = payload.role;
      s.userId = payload.userId;
      s.fullName = payload.fullName;
      s.expiresAt = payload.expiresAt;

      localStorage.setItem("accessToken", payload.token);
      if (payload.expiresAt) localStorage.setItem("expiresAt", String(payload.expiresAt));
    });
    b.addCase(loginThunk.rejected, (s, { payload }) => {
      s.isLoading = false;
      s.error = payload?.message || "Login failed";
    });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
