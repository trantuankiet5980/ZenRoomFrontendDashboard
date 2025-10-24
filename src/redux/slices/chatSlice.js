import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/axiosInstance";

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/chat/conversations");
      return response.data ?? [];
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể tải danh sách hội thoại."));
    }
  }
);

export const searchUsersByPhone = createAsyncThunk(
  "chat/searchUsersByPhone",
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/users/search/by-phone", {
        params: { phone: phoneNumber },
      });
      const data = response?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (error) {
      return rejectWithValue(
        resolveErrorMessage(error, "Không thể tìm kiếm người dùng theo số điện thoại."),
      );
    }
  }
);

export const fetchConversationSummary = createAsyncThunk(
  "chat/fetchConversationSummary",
  async (conversationId, { rejectWithValue }) => {
    try {
      const [unreadResponse, lastMessageResponse] = await Promise.all([
        axiosInstance.get(`/v1/chat/${conversationId}/unread-count`),
        axiosInstance.get(`/v1/chat/${conversationId}/last-message`),
      ]);

      return {
        conversationId,
        unread: unreadResponse?.data?.unread ?? 0,
        lastMessage: lastMessageResponse?.data ?? null,
      };
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể tải thông tin hội thoại."));
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/v1/chat/${conversationId}/messages`, {
        params: { page, size },
      });
      return { conversationId, page, size, data: response.data };
    } catch (error) {
      return rejectWithValue(
        resolveErrorMessage(error, "Không thể tải lịch sử tin nhắn."),
      );
    }
  }
);

export const markConversationRead = createAsyncThunk(
  "chat/markConversationRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/v1/chat/${conversationId}/read-all`);
      return { conversationId };
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể đánh dấu đã đọc."));
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, content, propertyId, peerId }, { rejectWithValue }) => {
    try {
      const payload = { content };
      if (conversationId) payload.conversationId = conversationId;
      if (propertyId) payload.propertyId = propertyId;
      if (peerId) payload.peerId = peerId;
      const response = await axiosInstance.post("/v1/chat/send", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể gửi tin nhắn."));
    }
  }
);

export const sendImagesMessage = createAsyncThunk(
  "chat/sendImagesMessage",
  async (
    { conversationId, peerId, propertyId, content = "", images },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      if (conversationId) formData.append("conversationId", conversationId);
      if (peerId) formData.append("peerId", peerId);
      if (propertyId) formData.append("propertyId", propertyId);
      if (content) formData.append("content", content);
      (images || []).forEach((file) => {
        if (file) formData.append("images", file);
      });

      const response = await axiosInstance.post("/v1/chat/send/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(resolveErrorMessage(error, "Không thể gửi hình ảnh."));
    }
  }
);

const initialState = {
  conversations: [],
  conversationsStatus: "idle",
  conversationsError: null,
  metaById: {},
  selectedConversationId: null,
  messagesById: {},
  messagesStatusById: {},
  messagesErrorById: {},
  sendStatus: "idle",
  sendError: null,
  uploadStatus: "idle",
  uploadError: null,
  searchResults: [],
  searchStatus: "idle",
  searchError: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedConversation(state, action) {
      state.selectedConversationId = action.payload || null;
    },
    clearUserSearch(state) {
      state.searchResults = [];
      state.searchStatus = "idle";
      state.searchError = null;
    },
    clearChatError(state, action) {
      const { scope, conversationId } = action.payload || {};
      if (!scope) {
        state.conversationsError = null;
        state.sendError = null;
        state.uploadError = null;
        state.searchError = null;
        state.messagesErrorById = {};
        return;
      }
      if (scope === "conversations") {
        state.conversationsError = null;
        return;
      }
      if (scope === "search") {
        state.searchError = null;
        return;
      }
      if (scope === "messages") {
        if (conversationId) {
          state.messagesErrorById[conversationId] = null;
        } else {
          state.messagesErrorById = {};
        }
        return;
      }
      if (scope === "send") {
        state.sendError = null;
        return;
      }
      if (scope === "upload") {
        state.uploadError = null;
      }
    },
    wsReceiveMessage(state, action) {
      const message = action.payload;
      const conversation = message?.conversation;
      const conversationId = conversation?.conversationId || message?.conversationId;
      if (!conversationId) return;

      if (conversation?.conversationId) {
        const existingIndex = state.conversations.findIndex(
          (item) => item.conversationId === conversation.conversationId,
        );
        if (existingIndex >= 0) {
          state.conversations[existingIndex] = {
            ...state.conversations[existingIndex],
            ...conversation,
          };
        } else {
          state.conversations.unshift(conversation);
        }
      }

      mergeMessageIntoState(state, conversationId, message);

      const meta = state.metaById[conversationId] || {};
      state.metaById[conversationId] = {
        ...meta,
        lastMessage: message,
        lastActivity: message?.createdAt || meta.lastActivity,
      };
    },
    wsUpdateInbox(state, action) {
      const payload = action.payload;
      if (!payload) return;
      const { conversationId, lastMessage, unread, lastActivity } = payload;
      if (!conversationId) return;

      const currentMeta = state.metaById[conversationId] || {};
      const nextMeta = { ...currentMeta };

      if (typeof unread === "number") {
        nextMeta.unread = unread;
      }
      if (lastActivity) {
        nextMeta.lastActivity = lastActivity;
      }
      if (lastMessage) {
        nextMeta.lastMessage = lastMessage;
      }

      state.metaById[conversationId] = nextMeta;

      if (lastMessage?.conversation?.conversationId || lastMessage?.conversationId) {
        state.conversations = ensureConversationPresent(state.conversations, lastMessage.conversation);
        mergeMessageIntoState(
          state,
          lastMessage?.conversation?.conversationId || lastMessage?.conversationId,
          lastMessage,
        );
      }
    },
    wsMessageRead(state, action) {
      const { conversationId, messageId } = action.payload || {};
      if (!conversationId || !messageId) return;
      const messagesState = state.messagesById[conversationId];
      if (!messagesState?.items?.length) return;
      const updated = messagesState.items.map((item) =>
        item?.messageId === messageId ? { ...item, isRead: true } : item,
      );
      state.messagesById[conversationId] = {
        ...messagesState,
        items: updated,
      };
    },
    wsConversationReadAll(state, action) {
      const { conversationId, isSelf } = action.payload || {};
      if (!conversationId) return;

      if (isSelf) {
        const meta = state.metaById[conversationId] || {};
        state.metaById[conversationId] = {
          ...meta,
          unread: 0,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(searchUsersByPhone.pending, (state) => {
        state.searchStatus = "loading";
        state.searchError = null;
      })
      .addCase(searchUsersByPhone.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload || [];
        state.searchError = null;
      })
      .addCase(searchUsersByPhone.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.searchStatus = "idle";
          return;
        }
        state.searchStatus = "failed";
        state.searchError = action.payload || action.error?.message || "Không thể tìm kiếm người dùng.";
      })
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = "loading";
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = "succeeded";
        state.conversations = action.payload || [];
        state.conversationsError = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.conversationsStatus = "idle";
          return;
        }
        state.conversationsStatus = "failed";
        state.conversationsError = action.payload || action.error?.message || "Không thể tải danh sách hội thoại.";
      })
      .addCase(fetchConversationSummary.fulfilled, (state, action) => {
        const { conversationId, unread, lastMessage } = action.payload;
        state.metaById[conversationId] = {
          ...(state.metaById[conversationId] || {}),
          unread,
          lastMessage,
        };
      })
      .addCase(fetchConversationSummary.rejected, (state, action) => {
        if (action.error?.name === "AbortError") return;
        const conversationId = action.meta?.arg;
        if (conversationId) {
          state.messagesErrorById[conversationId] = action.payload || action.error?.message || "Không thể tải thông tin hội thoại.";
        }
      })
      .addCase(fetchMessages.pending, (state, action) => {
        const { conversationId } = action.meta.arg;
        state.messagesStatusById[conversationId] = "loading";
        state.messagesErrorById[conversationId] = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, page, data } = action.payload;
        const previous = state.messagesById[conversationId] || {
          items: [],
          highestLoadedPage: -1,
        };
        const existingMap = new Map();
        previous.items.forEach((message) => {
          existingMap.set(message.messageId, message);
        });
        (data?.content || []).forEach((message) => {
          if (message?.messageId) existingMap.set(message.messageId, message);
        });
        const merged = Array.from(existingMap.values());
        merged.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

        state.messagesById[conversationId] = {
          items: merged,
          pageInfo: {
            number: data?.number ?? page,
            size: data?.size ?? previous.pageInfo?.size ?? 20,
            totalElements: data?.totalElements ?? previous.pageInfo?.totalElements ?? merged.length,
            totalPages: data?.totalPages ?? previous.pageInfo?.totalPages ?? 1,
            last: data?.last ?? false,
            first: data?.first ?? page === 0,
          },
          highestLoadedPage: Math.max(previous.highestLoadedPage ?? -1, page),
        };
        state.messagesStatusById[conversationId] = "succeeded";
        state.messagesErrorById[conversationId] = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const { conversationId } = action.meta.arg;
        if (action.error?.name === "AbortError") {
          state.messagesStatusById[conversationId] = "idle";
          return;
        }
        state.messagesStatusById[conversationId] = "failed";
        state.messagesErrorById[conversationId] =
          action.payload || action.error?.message || "Không thể tải lịch sử tin nhắn.";
      })
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        if (!state.metaById[conversationId]) {
          state.metaById[conversationId] = { unread: 0 };
        } else {
          state.metaById[conversationId].unread = 0;
        }
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = "loading";
        state.sendError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const conversation = message?.conversation;
        const conversationId = conversation?.conversationId || action.meta?.arg?.conversationId;
        if (conversation?.conversationId) {
          const existingIndex = state.conversations.findIndex(
            (item) => item.conversationId === conversation.conversationId,
          );
          if (existingIndex >= 0) {
            state.conversations[existingIndex] = {
              ...state.conversations[existingIndex],
              ...conversation,
            };
          } else {
            state.conversations.unshift(conversation);
          }
        }
        mergeMessageIntoState(state, conversationId, message);
        state.metaById[conversationId] = {
          ...(state.metaById[conversationId] || {}),
          lastMessage: message,
          unread: 0,
        };
        state.sendStatus = "succeeded";
        state.sendError = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.sendStatus = "idle";
          return;
        }
        state.sendStatus = "failed";
        state.sendError = action.payload || action.error?.message || "Không thể gửi tin nhắn.";
      })
      .addCase(sendImagesMessage.pending, (state) => {
        state.uploadStatus = "loading";
        state.uploadError = null;
      })
      .addCase(sendImagesMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const conversation = message?.conversation;
        const conversationId = conversation?.conversationId || action.meta?.arg?.conversationId;
        if (conversation?.conversationId) {
          const existingIndex = state.conversations.findIndex(
            (item) => item.conversationId === conversation.conversationId,
          );
          if (existingIndex >= 0) {
            state.conversations[existingIndex] = {
              ...state.conversations[existingIndex],
              ...conversation,
            };
          } else {
            state.conversations.unshift(conversation);
          }
        }
        mergeMessageIntoState(state, conversationId, message);
        state.metaById[conversationId] = {
          ...(state.metaById[conversationId] || {}),
          lastMessage: message,
          unread: 0,
        };
        state.uploadStatus = "succeeded";
        state.uploadError = null;
      })
      .addCase(sendImagesMessage.rejected, (state, action) => {
        if (action.error?.name === "AbortError") {
          state.uploadStatus = "idle";
          return;
        }
        state.uploadStatus = "failed";
        state.uploadError = action.payload || action.error?.message || "Không thể gửi hình ảnh.";
      });
  },
});

export const {
  setSelectedConversation,
  clearChatError,
  clearUserSearch,
  wsReceiveMessage,
  wsUpdateInbox,
  wsMessageRead,
  wsConversationReadAll,
} = chatSlice.actions;
export default chatSlice.reducer;

function mergeMessageIntoState(state, conversationId, message) {
  if (!conversationId || !message?.messageId) return;
  const current = state.messagesById[conversationId] || {
    items: [],
    pageInfo: null,
    highestLoadedPage: -1,
  };
  const items = current.items ? [...current.items] : [];
  const index = items.findIndex((item) => item.messageId === message.messageId);
  if (index >= 0) {
    items[index] = message;
  } else {
    items.push(message);
  }
  items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  state.messagesById[conversationId] = {
    ...current,
    items,
    pageInfo: current.pageInfo,
  };
  state.messagesStatusById[conversationId] = "succeeded";
}

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function ensureConversationPresent(list, conversation) {
  if (!conversation?.conversationId) return list;
  const existingIndex = list.findIndex((item) => item.conversationId === conversation.conversationId);
  if (existingIndex >= 0) {
    const next = [...list];
    next[existingIndex] = { ...next[existingIndex], ...conversation };
    return next;
  }
  return [conversation, ...list];
}