import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

const initialDataState = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
};

const initialState = {
  data: { ...initialDataState },
  status: "idle",
  error: null,
};

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await axiosInstance.get("/v1/reports", { params, signal });
      return response.data?.data ?? initialDataState;
    } catch (error) {
      if (signal.aborted || error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
        throwObjectWithAbortErrorName();
      }
      return rejectWithValue(resolveErrorMessage(error, "Không thể tải danh sách báo cáo."));
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload ?? {};
        state.data = {
          content: payload.content ?? [],
          totalElements: payload.totalElements ?? 0,
          totalPages: payload.totalPages ?? 0,
          size: payload.size ?? payload.pageSize ?? initialDataState.size,
          number: payload.number ?? payload.page ?? initialDataState.number,
        };
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.status = "idle";
          state.error = null;
          return;
        }

        state.status = "failed";
        state.error = action.payload || action.error?.message || "Không thể tải danh sách báo cáo.";
      });
  },
});

export const { clearReportsError } = reportsSlice.actions;
export default reportsSlice.reducer;

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function throwObjectWithAbortErrorName() {
  const abortError = new Error("Thao tác đã bị huỷ");
  abortError.name = "AbortError";
  throw abortError;
}