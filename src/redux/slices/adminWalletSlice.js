import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

const DEFAULT_ERROR_MESSAGE = "Không thể tải dữ liệu ví của admin.";

export const fetchAdminWallet = createAsyncThunk(
  "adminWallet/fetchAdminWallet",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/wallet", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || DEFAULT_ERROR_MESSAGE);
    }
  }
);

const initialState = {
  wallet: null,
  transactions: [],
  status: "idle",
  error: null,
};

const adminWalletSlice = createSlice({
  name: "adminWallet",
  initialState,
  reducers: {
    clearAdminWalletError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminWallet.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminWallet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wallet = action.payload?.wallet || null;
        state.transactions = action.payload?.transactions || [];
      })
      .addCase(fetchAdminWallet.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.status = "idle";
          state.error = null;
          return;
        }
        state.status = "failed";
        state.error = action.payload || action.error?.message || DEFAULT_ERROR_MESSAGE;
      });
  },
});

export const { clearAdminWalletError } = adminWalletSlice.actions;
export default adminWalletSlice.reducer;