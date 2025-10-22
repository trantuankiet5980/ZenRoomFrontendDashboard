import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

const DEFAULT_ERROR_MESSAGE = "Không thể tải danh sách mã giảm giá.";
const CREATE_ERROR_MESSAGE = "Không thể tạo mã giảm giá.";
const UPDATE_ERROR_MESSAGE = "Không thể cập nhật mã giảm giá.";
const DELETE_ERROR_MESSAGE = "Không thể xoá mã giảm giá.";

export const fetchDiscountCodes = createAsyncThunk(
  "discountCodes/fetchList",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/v1/discount-codes", { params });
      return data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, DEFAULT_ERROR_MESSAGE));
    }
  }
);

export const createDiscountCode = createAsyncThunk(
  "discountCodes/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/discount-codes", payload);
      return data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, CREATE_ERROR_MESSAGE));
    }
  }
);

export const updateDiscountCode = createAsyncThunk(
  "discountCodes/update",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/v1/discount-codes", payload);
      return data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, UPDATE_ERROR_MESSAGE));
    }
  }
);

export const deleteDiscountCode = createAsyncThunk(
  "discountCodes/delete",
  async (codeId, { rejectWithValue }) => {
    if (!codeId) {
      return rejectWithValue("Không xác định được mã giảm giá.");
    }

    try {
      await axiosInstance.delete(`/v1/discount-codes/${codeId}`);
      return { codeId };
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, DELETE_ERROR_MESSAGE));
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
  creating: false,
  updatingId: null,
  deletingId: null,
  mutationError: null,
};

const discountCodesSlice = createSlice({
  name: "discountCodes",
  initialState,
  reducers: {
    clearDiscountCodesError(state) {
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountCodes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDiscountCodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.data = action.payload || initialState.data;
      })
      .addCase(fetchDiscountCodes.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.status = "idle";
          state.error = null;
          return;
        }
        state.status = "failed";
        state.error = action.payload || action.error?.message || DEFAULT_ERROR_MESSAGE;
      })
      .addCase(createDiscountCode.pending, (state) => {
        state.creating = true;
        state.mutationError = null;
      })
      .addCase(createDiscountCode.fulfilled, (state, action) => {
        state.creating = false;
        state.mutationError = null;
        const created = action.payload;
        if (!created) {
          return;
        }
        const list = state.data?.content;
        if (Array.isArray(list)) {
          list.unshift(created);
          if (state.data.size && list.length > state.data.size) {
            list.pop();
          }
        }
        if (typeof state.data.totalElements === "number") {
          state.data.totalElements += 1;
        }
      })
      .addCase(createDiscountCode.rejected, (state, action) => {
        state.creating = false;
        state.mutationError = action.payload || action.error?.message || CREATE_ERROR_MESSAGE;
      })
      .addCase(updateDiscountCode.pending, (state, action) => {
        state.updatingId = action.meta?.arg?.codeId || null;
        state.mutationError = null;
      })
      .addCase(updateDiscountCode.fulfilled, (state, action) => {
        state.mutationError = null;
        const updated = action.payload;
        if (!updated?.codeId) {
          state.updatingId = null;
          return;
        }
        const list = state.data?.content;
        if (Array.isArray(list) && list.length) {
          const index = list.findIndex((item) => item.codeId === updated.codeId);
          if (index !== -1) {
            list[index] = {
              ...list[index],
              ...updated,
            };
          }
        }
        state.updatingId = null;
      })
      .addCase(updateDiscountCode.rejected, (state, action) => {
        state.mutationError = action.payload || action.error?.message || UPDATE_ERROR_MESSAGE;
        state.updatingId = null;
      })
      .addCase(deleteDiscountCode.pending, (state, action) => {
        state.deletingId = action.meta?.arg || null;
        state.mutationError = null;
      })
      .addCase(deleteDiscountCode.fulfilled, (state, action) => {
        state.mutationError = null;
        const deletedId = action.payload?.codeId;
        const list = state.data?.content;
        if (deletedId && Array.isArray(list) && list.length) {
          const index = list.findIndex((item) => item.codeId === deletedId);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
        if (deletedId && typeof state.data.totalElements === "number" && state.data.totalElements > 0) {
          state.data.totalElements -= 1;
        }
        state.deletingId = null;
      })
      .addCase(deleteDiscountCode.rejected, (state, action) => {
        state.mutationError = action.payload || action.error?.message || DELETE_ERROR_MESSAGE;
        state.deletingId = null;
      });
  },
});

export const { clearDiscountCodesError } = discountCodesSlice.actions;
export default discountCodesSlice.reducer;

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}