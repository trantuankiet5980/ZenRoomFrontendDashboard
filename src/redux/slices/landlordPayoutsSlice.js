import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

const DEFAULT_ERROR_MESSAGE = "Không thể tải thống kê chi trả cho chủ nhà.";

export const fetchLandlordPayouts = createAsyncThunk(
  "landlordPayouts/fetchLandlordPayouts",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        "/v1/invoices/stats/landlords/payouts/yearly",
        { params }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || DEFAULT_ERROR_MESSAGE);
    }
  }
);

const initialState = {
  data: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
  },
  status: "idle",
  error: null,
};

const landlordPayoutsSlice = createSlice({
  name: "landlordPayouts",
  initialState,
  reducers: {
    clearLandlordPayoutsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandlordPayouts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLandlordPayouts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload || initialState.data;
      })
      .addCase(fetchLandlordPayouts.rejected, (state, action) => {
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

export const { clearLandlordPayoutsError } = landlordPayoutsSlice.actions;
export default landlordPayoutsSlice.reducer;