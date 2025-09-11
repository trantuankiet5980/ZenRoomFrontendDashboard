import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/auth/login", {
        phoneNumber,
        password,
      });
      if (!data?.token) throw new Error(data?.message || "No token returned");
      return data; // { success, message, token, role, userId, fullName, expiresAt }
    } catch (err) {
        const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Login failed";
      return rejectWithValue({ message: msg });    }
  }
);

const slice = createSlice({
  name: "auth",
  initialState: {
    accessToken: localStorage.getItem("accessToken") || null,
    role: null,
    userId: null,
    fullName: null,
    expiresAt: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.role = null;
      state.userId = null;
      state.fullName = null;
      state.expiresAt = null;
      localStorage.removeItem("accessToken");
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => {
      s.isLoading = true;
      s.error = null;
    });
    b.addCase(loginThunk.fulfilled, (s, { payload }) => {
      s.isLoading = false;
      s.accessToken = payload.token;
      s.role = payload.role;
      s.userId = payload.userId;
      s.fullName = payload.fullName;
      s.expiresAt = payload.expiresAt;
      localStorage.setItem("accessToken", payload.token);
    });
    b.addCase(loginThunk.rejected, (s, { payload }) => {
      s.isLoading = false;
      s.error = payload?.message || "Login failed";
    });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
