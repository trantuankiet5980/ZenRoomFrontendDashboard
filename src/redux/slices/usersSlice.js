import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/users", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể tải danh sách người dùng."));
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/v1/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể tải thông tin người dùng."));
    }
  }
);

export const updateUserById = createAsyncThunk(
  "users/updateUserById",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/v1/users/${userId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể cập nhật thông tin người dùng."));
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

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.status = "idle";
          state.error = null;
          return;
        }

        state.status = "failed";
        state.error = action.payload || action.error?.message || "Không thể tải danh sách người dùng.";
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}