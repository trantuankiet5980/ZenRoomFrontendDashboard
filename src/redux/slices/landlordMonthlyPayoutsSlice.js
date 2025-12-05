import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

const DEFAULT_ERROR_MESSAGE = "Không thể tải thống kê chi trả cho chủ nhà.";

export const fetchLandlordMonthlyPayouts = createAsyncThunk(
  "landlordMonthlyPayouts/fetchLandlordMonthlyPayouts",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        "/v1/invoices/stats/landlords/monthly/payouts",
        { params }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || DEFAULT_ERROR_MESSAGE);
    }
  }
);

const initialState = {
  summary: null,
  landlords: [],
  status: "idle",
  error: null,
};

const landlordMonthlyPayoutsSlice = createSlice({
  name: "landlordMonthlyPayouts",
  initialState,
  reducers: {
    clearLandlordMonthlyPayoutsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandlordMonthlyPayouts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLandlordMonthlyPayouts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload || null;
        state.landlords = action.payload?.landlords || [];
      })
      .addCase(fetchLandlordMonthlyPayouts.rejected, (state, action) => {
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

export const { clearLandlordMonthlyPayoutsError } = landlordMonthlyPayoutsSlice.actions;
export default landlordMonthlyPayoutsSlice.reducer;