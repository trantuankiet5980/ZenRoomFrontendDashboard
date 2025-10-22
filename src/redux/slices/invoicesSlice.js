import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

const DEFAULT_ERROR_MESSAGE = "Không thể tải danh sách hoá đơn.";
const REFUND_ERROR_MESSAGE = "Không thể xác nhận hoàn tiền cho hoá đơn.";

export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/invoices", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, DEFAULT_ERROR_MESSAGE));
    }
  }
);

export const refundInvoice = createAsyncThunk(
  "invoices/refundInvoice",
  async ({ invoiceId }, { rejectWithValue }) => {
    if (!invoiceId) {
      return rejectWithValue("Không xác định được mã hoá đơn.");
    }

    try {
      const response = await axiosInstance.post(`/v1/invoices/${invoiceId}/confirm-refund`);
      return response.data ?? { invoiceId, status: "REFUNDED" };
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, REFUND_ERROR_MESSAGE));
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
  actionLoadingId: null,
  actionError: null,
};

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearInvoicesError(state) {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.data = action.payload || initialState.data;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.status = "idle";
          state.error = null;
          return;
        }
        state.status = "failed";
        state.error = action.payload || action.error?.message || DEFAULT_ERROR_MESSAGE;
      })
      .addCase(refundInvoice.pending, (state, action) => {
        state.actionError = null;
        state.actionLoadingId = action.meta?.arg?.invoiceId || null;
      })
      .addCase(refundInvoice.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = null;

        const updatedInvoice = normalizeInvoicePayload(action.payload);
        if (!updatedInvoice?.invoiceId) {
          return;
        }

        const list = state.data?.content;
        if (!Array.isArray(list) || !list.length) {
          return;
        }

        const index = list.findIndex((item) => item.invoiceId === updatedInvoice.invoiceId);
        if (index === -1) {
          return;
        }

        list[index] = {
          ...list[index],
          ...updatedInvoice,
        };
      })
      .addCase(refundInvoice.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload || action.error?.message || REFUND_ERROR_MESSAGE;
      });
  },
});

export const { clearInvoicesError } = invoicesSlice.actions;
export default invoicesSlice.reducer;

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function normalizeInvoicePayload(payload) {
  if (!payload) return null;
  if (payload.invoiceId) return payload;
  if (payload.invoice) return payload.invoice;
  if (payload.data?.invoice) return payload.data.invoice;
  if (payload.data?.invoiceId) return payload.data;
  return payload;
}