import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";
import { showToast } from "../../utils/toast";

const saved = JSON.parse(localStorage.getItem("auth") || "null");

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

// Profile me
export const fetchProfile = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/auth/me");
      return data; // { fullName, role, userId, ... }
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Load profile failed" });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/v1/users/profile", body);
      return data; // nên trả lại { userId, fullName, phoneNumber, email, avatarUrl, ... }
    } catch (e) {
      return rejectWithValue(e?.response?.data || { message: "Cập nhật hồ sơ thất bại" });
    }
  }
);

/* ========= Forgot password thunks ========= */
export const sendOtp = createAsyncThunk(
  "auth/forgot/sendOtp",
  async ({ phoneNumber }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/auth/send-reset-otp", { phoneNumber });
      
      return { phoneNumber, sessionId: data?.sessionId || null, message: data?.message };
    } catch (err) {
      return rejectWithValue({ message: err?.response?.data?.message || "Gửi OTP thất bại" });
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/forgot/verifyOtp",
  async ({ phoneNumber, otp, sessionId }, { rejectWithValue }) => {
    try {
      const body = { phoneNumber, otp, ...(sessionId ? { sessionId } : {}) };
      const { data } = await axiosInstance.post("/v1/auth/verify-otp-sns", body);
      return { phoneNumber, otp, sessionId, message: data?.message };
    } catch (err) {
      return rejectWithValue({ message: err?.response?.data?.message || "OTP không đúng hoặc đã hết hạn" });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/forgot/resetPassword",
  async ({ phoneNumber, otp, newPassword, sessionId }, { rejectWithValue }) => {
    try {
      const body = { phoneNumber, otp, newPassword, ...(sessionId ? { sessionId } : {}) };
      const { data } = await axiosInstance.post("/v1/auth/reset-password", body);
      return { message: data?.message || "Đặt lại mật khẩu thành công" };
    } catch (err) {
      return rejectWithValue({ message: err?.response?.data?.message || "Đặt lại mật khẩu thất bại" });
    }
  }
);

const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  role: saved?.role || null, 
  userId: saved?.userId || null, 
  fullName: saved?.fullName || null,
  gender: saved?.gender || null,
  dateOfBirth: saved?.dateOfBirth || null, // ISO
  avatarUrl: saved?.avatarUrl || null,
  email: saved?.email || null,
  phoneNumber: saved?.phoneNumber || null,

  // cờ trạng thái
  profileLoading: false,
  isLoading: false, // cho updateProfile
  error: null,

    // forgot password flow
  fp: {
    step: 1,            // 1: phone -> 2: otp -> 3: new pass
    phoneNumber: "",
    sessionId: null,    // tuỳ backend
    otp: "",
    otpVerified: false,
    sending: false,
    verifying: false,
    resetting: false,
    countdown: 0,       // giây chờ resend
  }
};

let logoutTimerId = null;
//  util nội bộ: lên lịch auto-logout theo expiresAt (ms)
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
      state.gender = null;
      state.dateOfBirth = null;
      state.avatarUrl = null;
      state.email = null;
      state.phoneNumber = null;
      localStorage.removeItem("auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("expiresAt");
      // không navigate ở reducer; ProtectedRoute sẽ tự đẩy về /login
    },
    setCountdown(state, { payload }) {
      state.fp.countdown = payload ?? 0;
    },
    resetForgotFlow(state) {
      state.fp = { ...initialState.fp };
    }
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

      // persist cả khối
      const auth = {
        token: payload.token,
        role: payload.role,
        userId: payload.userId,
        fullName: payload.fullName,
        expiresAt: payload.expiresAt,
      };
      localStorage.setItem("auth", JSON.stringify(auth));
      localStorage.setItem("accessToken", payload.token);
      if (payload.expiresAt) localStorage.setItem("expiresAt", String(payload.expiresAt));
    });
    b.addCase(loginThunk.rejected, (s, { payload }) => {
      s.isLoading = false;
      s.error = payload?.message || "Login failed";
    });
    b.addCase(fetchProfile.pending, (s) => { s.profileLoading = true; s.error = null; });
    b.addCase(fetchProfile.fulfilled, (s, { payload }) => {
      s.profileLoading = false;
      // GÁN ĐỦ FIELD
      s.userId = payload.userId ?? s.userId;
      s.fullName = payload.fullName ?? s.fullName;
      s.gender = payload.gender ?? s.gender;
      s.dateOfBirth = payload.dateOfBirth ?? s.dateOfBirth;
      s.avatarUrl = payload.avatarUrl ?? s.avatarUrl;
      s.email = payload.email ?? s.email;
      s.phoneNumber = payload.phoneNumber ?? s.phoneNumber;

      // lưu lại localStorage để F5 vẫn thấy
      const cur = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem("auth", JSON.stringify({
        ...cur,
        token: s.accessToken,
        role: s.role,
        userId: s.userId,
        fullName: s.fullName,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        avatarUrl: s.avatarUrl,
        email: s.email,
        phoneNumber: s.phoneNumber,
      }));
    });
    b.addCase(fetchProfile.rejected, (s, { payload }) => {
      s.profileLoading = false;
      s.error = payload?.message || null;
    });
    // updateProfile
    b.addCase(updateProfile.pending, (s) => { s.isLoading = true; s.error = null; });
    b.addCase(updateProfile.fulfilled, (s, { payload }) => {
      s.isLoading = false;

      // gán về state với các field yêu cầu
      s.fullName = payload.fullName ?? s.fullName;
      s.gender = payload.gender ?? s.gender;
      s.dateOfBirth = payload.dateOfBirth ?? s.dateOfBirth;
      s.avatarUrl = payload.avatarUrl ?? s.avatarUrl;
      s.email = payload.email ?? s.email;
      s.phoneNumber = payload.phoneNumber ?? s.phoneNumber;

      const cur = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem("auth", JSON.stringify({
        ...cur,
        token: s.accessToken,
        role: s.role,
        userId: s.userId,
        fullName: s.fullName,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        avatarUrl: s.avatarUrl,
        email: s.email,
        phoneNumber: s.phoneNumber,
        expiresAt: s.expiresAt,
      }));

      showToast("success", "Đã cập nhật hồ sơ thành công.");
    });
    b.addCase(updateProfile.rejected, (s, { payload }) => {
      s.isLoading = false;
      s.error = payload?.message || "Cập nhật hồ sơ thất bại";
      showToast("error", "Lỗi " + s.error);
    });
    /* ---- forgot: send otp ---- */
    b.addCase(sendOtp.pending, (s) => {
      s.fp.sending = true;
    });
    b.addCase(sendOtp.fulfilled, (s, { payload }) => {
      s.fp.sending = false;
      s.fp.phoneNumber = payload.phoneNumber;
      s.fp.sessionId = payload.sessionId || null;
      s.fp.step = 2;
      s.fp.countdown = 60;
      showToast("success", payload.message || "Đã gửi mã OTP");
    });
    b.addCase(sendOtp.rejected, (s, { payload }) => {
      s.fp.sending = false;
      showToast("error", payload?.message || "Gửi OTP thất bại");
    });

    /* ---- forgot: verify otp ---- */
    b.addCase(verifyOtp.pending, (s) => {
      s.fp.verifying = true;
    });
    b.addCase(verifyOtp.fulfilled, (s, { payload }) => {
      s.fp.verifying = false;
      s.fp.otpVerified = true;
      s.fp.otp = payload.otp;
      s.fp.step = 3;
      showToast("success", payload.message || "Xác minh OTP thành công");
    });
    b.addCase(verifyOtp.rejected, (s, { payload }) => {
      s.fp.verifying = false;
      showToast("error", payload?.message || "OTP không đúng hoặc đã hết hạn");
    });

    /* ---- forgot: reset password ---- */
    b.addCase(resetPassword.pending, (s) => {
      s.fp.resetting = true;
    });
    b.addCase(resetPassword.fulfilled, (s, { payload }) => {
      s.fp.resetting = false;
      showToast("success", payload.message || "Đặt lại mật khẩu thành công 🎉");
      s.fp = { ...initialState.fp }; // clear flow
    });
    b.addCase(resetPassword.rejected, (s, { payload }) => {
      s.fp.resetting = false;
      showToast("error", payload?.message || "Đặt lại mật khẩu thất bại");
    });
  },
});

export const { logout, setCountdown, resetForgotFlow  } = slice.actions;
export default slice.reducer;
