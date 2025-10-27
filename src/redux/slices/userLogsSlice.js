import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

export const fetchUserLogs = createAsyncThunk(
  "userLogs/fetchUserLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/admin/user-management-logs", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể tải nhật ký người dùng."));
    }
  }
);

const initialState = {
  data: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
  },
  status: "idle",
  error: null,
};

const userLogsSlice = createSlice({
  name: "userLogs",
  initialState,
  reducers: {
    clearUserLogsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLogs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserLogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserLogs.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.status = "idle";
          state.error = null;
          return;
        }

        state.status = "failed";
        state.error = action.payload || action.error?.message || "Không thể tải nhật ký người dùng.";
      });
  },
});

export const { clearUserLogsError } = userLogsSlice.actions;
export default userLogsSlice.reducer;

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}