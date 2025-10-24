import { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import PageShell from "../components/PageShell";
import PageSection from "../components/PageSection";
import { formatCurrency } from "../utils/format";
import { resolveAssetUrl, resolveAvatarUrl } from "../utils/cdn";
import { showToast } from "../utils/toast";
import {
  clearChatError,
  clearUserSearch,
  deleteConversation,
  fetchConversationSummary,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  searchUsersByPhone,
  sendImagesMessage,
  sendMessage,
  setSelectedConversation,
  resetDeleteConversationState,
} from "../redux/slices/chatSlice";
import useChatSocket from "../hooks/useChatSocket";
import EmojiMartPicker from "../components/EmojiMartPicker";
import ConfirmModal from "./users/ConfirmModal";

export default function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    conversations,
    conversationsStatus,
    conversationsError,
    metaById,
    selectedConversationId,
    messagesById,
    messagesStatusById,
    messagesErrorById,
    sendStatus,
    sendError,
    uploadStatus,
    uploadError,
    searchResults,
    searchStatus,
    searchError,
    deleteStatus,
    deleteError,
    deletingConversationId,
  } = useSelector((state) => state.chat);
  const currentUserId = useSelector((state) => state.auth.userId);

  useChatSocket();

  const [searchTerm, setSearchTerm] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const messageListRef = useRef(null);
  const skipScrollRef = useRef(false);
  const emojiPickerRef = useRef(null);
  const notificationIntervalRef = useRef(null);
  const defaultTitleRef = useRef(typeof document !== "undefined" ? document.title : "");
  const notificationInitializedRef = useRef(false);
  const lastMessageIdsRef = useRef(new Map());
  const audioRef = useRef(null);

  useEffect(() => {
    if (conversationsStatus === "idle") {
      dispatch(fetchConversations());
    }
  }, [dispatch, conversationsStatus]);

  useEffect(() => {
    if (conversationsError) {
      showToast("error", conversationsError);
      dispatch(clearChatError({ scope: "conversations" }));
    }
  }, [conversationsError, dispatch]);

  useEffect(() => {
    if (sendError) {
      showToast("error", sendError);
      dispatch(clearChatError({ scope: "send" }));
    }
  }, [sendError, dispatch]);

  useEffect(() => {
    if (uploadError) {
      showToast("error", uploadError);
      dispatch(clearChatError({ scope: "upload" }));
    }
  }, [uploadError, dispatch]);

  useEffect(() => {
    if (searchError) {
      showToast("error", searchError);
      dispatch(clearChatError({ scope: "search" }));
    }
  }, [searchError, dispatch]);

  useEffect(() => {
    if (deleteStatus === "succeeded") {
      showToast("success", "Đã xóa đoạn chat.");
      dispatch(resetDeleteConversationState());
    }
  }, [deleteStatus, dispatch]);

  useEffect(() => {
    if (deleteStatus === "failed" && deleteError) {
      showToast("error", deleteError);
      dispatch(resetDeleteConversationState());
    }
  }, [deleteStatus, deleteError, dispatch]);

  useEffect(() => {
    if (deleteStatus === "succeeded" || deleteStatus === "failed") {
      setDeleteTargetId(null);
    }
  }, [deleteStatus]);
  
  const sortedConversations = useMemo(() => {
    if (!conversations?.length) return [];
    return [...conversations]
      .map((conversation) => {
        const meta = metaById[conversation.conversationId] || {};
        const lastMessage = meta.lastMessage;
        const lastActivity =
          meta.lastActivity || lastMessage?.createdAt || conversation.createdAt;
        return {
          ...conversation,
          lastActivity,
          unread: meta.unread ?? 0,
          lastMessage,
        };
      })
      .sort((a, b) => {
        const aTime = new Date(a.lastActivity || 0).getTime();
        const bTime = new Date(b.lastActivity || 0).getTime();
        return bTime - aTime;
      });
  }, [conversations, metaById]);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sortedConversations;
    return sortedConversations.filter((conversation) => {
      const tenantName = conversation?.tenant?.fullName || "";
      const landlordName = conversation?.landlord?.fullName || "";
      const tenantPhone = conversation?.tenant?.phoneNumber || "";
      const landlordPhone = conversation?.landlord?.phoneNumber || "";
      return [tenantName, landlordName, tenantPhone, landlordPhone]
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [sortedConversations, searchTerm]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.conversationId === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const selectedMessagesState = selectedConversationId
    ? messagesById[selectedConversationId]
    : null;
  const selectedMessages = selectedMessagesState?.items || [];
  const selectedMessagesStatus = selectedConversationId
    ? messagesStatusById[selectedConversationId] || "idle"
    : "idle";
  const selectedMessagesError = selectedConversationId
    ? messagesErrorById[selectedConversationId]
    : null;

  useEffect(() => {
    if (!selectedConversationId) return;
    if (!selectedMessagesError) return;
    showToast("error", selectedMessagesError);
    dispatch(clearChatError({ scope: "messages", conversationId: selectedConversationId }));
  }, [dispatch, selectedConversationId, selectedMessagesError]);

  useEffect(() => {
    if (!conversations?.length) return;
    conversations.forEach((conversation) => {
      dispatch(fetchConversationSummary(conversation.conversationId));
    });
  }, [dispatch, conversations]);

  useEffect(() => {
    if (selectedConversationId) return;
    if (selectedPeer) return;
    const firstConversation = sortedConversations[0];
    if (firstConversation) {
      dispatch(setSelectedConversation(firstConversation.conversationId));
    }
  }, [sortedConversations, selectedConversationId, selectedPeer, dispatch]);

  useEffect(() => {
    if (!selectedConversationId) return;
    if (selectedMessagesState) return;
    dispatch(fetchMessages({ conversationId: selectedConversationId, page: 0, size: 20 }));
  }, [dispatch, selectedConversationId, selectedMessagesState]);

  useEffect(() => {
    if (!selectedConversationId) return;
    dispatch(markConversationRead(selectedConversationId));
    dispatch(fetchConversationSummary(selectedConversationId));
  }, [dispatch, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    if (selectedMessagesStatus !== "succeeded") return;
    if (!messageListRef.current) return;
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [selectedConversationId, selectedMessages.length, selectedMessagesStatus]);

  useEffect(() => {
    skipScrollRef.current = false;
    setMessageContent("");
  }, [selectedConversationId, selectedPeer?.userId]);

  useEffect(() => {
    setIsEmojiPickerOpen(false);
  }, [selectedConversationId, selectedPeer?.userId]);

  useEffect(() => {
    if (!isEmojiPickerOpen) return;
    const handleClick = (event) => {
      if (!emojiPickerRef.current) return;
      if (!emojiPickerRef.current.contains(event.target)) {
        setIsEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isEmojiPickerOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const audio = new Audio(`${process.env.PUBLIC_URL || ""}/sounds/message-notification.wav`);
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
        notificationIntervalRef.current = null;
      }
      if (typeof document !== "undefined") {
        document.title = defaultTitleRef.current || document.title;
      }
      audio.pause?.();
      audioRef.current = null;
    };
  }, []);

  const stopActiveNotification = useCallback(() => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
    if (typeof document !== "undefined") {
      document.title = defaultTitleRef.current || document.title;
    }
    setActiveNotification(null);
  }, []);

  const triggerNotification = useCallback(
    (conversationId, senderName) => {
      const label = `Bạn có tin nhắn từ ${senderName}`;
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = 0;
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } catch (_) {
          // Ignore playback errors (autoplay restrictions, etc.)
        }
      }

      setActiveNotification({ conversationId, label, timestamp: Date.now() });

      if (typeof document === "undefined") return;
      document.title = label;
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
      let toggle = false;
      notificationIntervalRef.current = window.setInterval(() => {
        toggle = !toggle;
        document.title = toggle ? label : defaultTitleRef.current || label;
      }, 1500);
    },
    []
  );

  useEffect(() => {
    if (!activeNotification) return undefined;
    const handleVisibility = () => {
      if (document.hidden) return;
      stopActiveNotification();
    };
    const handleFocus = () => {
      stopActiveNotification();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [activeNotification, stopActiveNotification]);

  useEffect(() => {
    if (!notificationInitializedRef.current) {
      notificationInitializedRef.current = true;
      return;
    }
    if (!conversations?.length) {
      lastMessageIdsRef.current = new Map();
      return;
    }

    const updates = [];
    conversations.forEach((conversation) => {
      const conversationId = conversation?.conversationId;
      if (!conversationId) return;
      const meta = metaById[conversationId];
      const lastMessage = meta?.lastMessage;
      const messageId = lastMessage?.messageId;
      if (!messageId) return;

      const previousId = lastMessageIdsRef.current.get(conversationId);
      if (previousId !== messageId) {
        updates.push({ conversationId, lastMessage });
        lastMessageIdsRef.current.set(conversationId, messageId);
      }
    });

    updates.forEach(({ conversationId, lastMessage }) => {
      if (!lastMessage) return;
      if (lastMessage.sender?.userId === currentUserId) return;
      if (
        selectedConversationId === conversationId &&
        typeof document !== "undefined" &&
        !document.hidden &&
        document.hasFocus()
      ) {
        return;
      }
      const senderName = lastMessage?.sender?.fullName || "người dùng";
      showToast("info", `Bạn có tin nhắn mới từ ${senderName}`);
      triggerNotification(conversationId, senderName);
    });
  }, [conversations, currentUserId, metaById, selectedConversationId, triggerNotification]);

  useEffect(() => {
    if (!conversations?.length) return;
    conversations.forEach((conversation) => {
      const conversationId = conversation?.conversationId;
      const lastMessage = metaById[conversationId]?.lastMessage;
      if (!conversationId || !lastMessage?.messageId) return;
      if (!lastMessageIdsRef.current.has(conversationId)) {
        lastMessageIdsRef.current.set(conversationId, lastMessage.messageId);
      }
    });
  }, [conversations, metaById]);

  useEffect(() => {
    if (!activeNotification) return;
    if (selectedConversationId && activeNotification.conversationId === selectedConversationId) {
      stopActiveNotification();
    }
  }, [activeNotification, selectedConversationId, stopActiveNotification]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSelectConversation = useCallback(
    (conversationId) => {
      if (!conversationId) return;
      setSelectedPeer(null);
      dispatch(setSelectedConversation(conversationId));
    },
    [dispatch]
  );

  const handleSearchSubmit = useCallback(
    (event) => {
      event?.preventDefault();
      const term = searchTerm.trim();
      if (!term) {
        dispatch(clearUserSearch());
        return;
      }
      dispatch(searchUsersByPhone(term));
    },
    [dispatch, searchTerm]
  );

  const findConversationByUserId = useCallback(
    (userId) => {
      if (!userId) return null;
      return (
        conversations.find(
          (conversation) =>
            conversation?.tenant?.userId === userId ||
            conversation?.landlord?.userId === userId
        ) || null
      );
    },
    [conversations]
  );

  const handleSelectUserResult = useCallback(
    (user) => {
      if (!user?.userId) return;
      const existing = findConversationByUserId(user.userId);
      if (existing) {
        setSelectedPeer(null);
        dispatch(setSelectedConversation(existing.conversationId));
        return;
      }
      dispatch(setSelectedConversation(null));
      setSelectedPeer(user);
    },
    [dispatch, findConversationByUserId]
  );

  useEffect(() => {
    if (searchTerm.trim()) return;
    if (searchStatus === "idle" && !searchResults.length) return;
    dispatch(clearUserSearch());
  }, [searchTerm, searchStatus, searchResults, dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!selectedConversationId) return;
    const state = messagesById[selectedConversationId];
    if (!state) return;
    const totalPages = state?.pageInfo?.totalPages ?? 0;
    const highest = state?.highestLoadedPage ?? -1;
    if (totalPages && highest + 1 >= totalPages) return;
    if (state?.pageInfo?.last) return;
    const nextPage = highest + 1;
    skipScrollRef.current = true;
    setIsLoadingOlder(true);
    dispatch(
      fetchMessages({
        conversationId: selectedConversationId,
        page: nextPage,
        size: state?.pageInfo?.size || 20,
      })
    ).finally(() => {
      setIsLoadingOlder(false);
    });
  }, [dispatch, messagesById, selectedConversationId]);

  const sendChatMessage = useCallback(
    (content, { clearInput = false } = {}) => {
      const trimmed = (content || "").trim();
      if (!trimmed) return Promise.resolve(null);
      const conversationId = selectedConversationId;
      const propertyId = selectedConversation?.property?.propertyId;
      const peerId = selectedPeer?.userId || resolvePeerId(selectedConversation, currentUserId);
      if (!conversationId && !peerId) return Promise.resolve(null);
      return dispatch(
        sendMessage({
          conversationId,
          content: trimmed,
          propertyId,
          peerId,
        })
      )
        .unwrap()
        .then((message) => {
          if (clearInput) {
            setMessageContent("");
          }
          const newConversationId = message?.conversation?.conversationId;
          if (newConversationId && newConversationId !== selectedConversationId) {
            dispatch(setSelectedConversation(newConversationId));
            setSelectedPeer(null);
          }
          return message;
        });
    },
    [
      dispatch,
      selectedConversationId,
      selectedConversation,
      selectedPeer,
      currentUserId,
      setSelectedPeer,
      setMessageContent,
    ]
  );

  const handleSendText = useCallback(
    (event) => {
      event?.preventDefault();
      sendChatMessage(messageContent, { clearInput: true }).catch(() => {});
    },
    [messageContent, sendChatMessage]
  );

  const handleEmojiSelect = useCallback((emoji) => {
    if (!emoji) return;
    const symbol =
      typeof emoji === "string"
        ? emoji
        : emoji.emoji || emoji.native || emoji.colons || emoji.shortcodes || "";
    if (!symbol) return;
    setMessageContent((prev) => `${prev}${symbol}`);
  }, []);

  const handleUploadImages = useCallback(
    (event) => {
      if (!selectedConversationId && !selectedPeer) return;
      const input = event.target;
      const files = Array.from(input?.files || []);
      if (!files.length) return;
      const propertyId = selectedConversation?.property?.propertyId;
      const conversationId = selectedConversationId;
      const peerId = selectedPeer?.userId || resolvePeerId(selectedConversation, currentUserId);
      if (!conversationId && !peerId) return;
      dispatch(
        sendImagesMessage({
          conversationId,
          images: files,
          propertyId,
          peerId,
          content: messageContent.trim(),
        })
      )
        .unwrap()
        .then((message) => {
          setMessageContent("");
          const newConversationId = message?.conversation?.conversationId;
          if (newConversationId) {
            dispatch(setSelectedConversation(newConversationId));
            setSelectedPeer(null);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (input) {
            input.value = "";
          }
        });
    },
    [
      dispatch,
      selectedConversationId,
      selectedConversation,
      selectedPeer,
      currentUserId,
      messageContent,
    ]
  );

  const canLoadMore = useMemo(() => {
    if (!selectedConversationId) return false;
    const state = messagesById[selectedConversationId];
    if (!state) return false;
    if (!state.pageInfo) return false;
    if (state.pageInfo.last) return false;
    const totalPages = state.pageInfo.totalPages ?? 0;
    const highest = state.highestLoadedPage ?? -1;
    return totalPages > 0 && highest + 1 < totalPages;
  }, [messagesById, selectedConversationId]);

  const peerUser = useMemo(
    () => resolvePartner(selectedConversation, currentUserId),
    [selectedConversation, currentUserId]
  );

  const handleDeleteConversation = useCallback(
    (conversationId) => {
      const targetId = conversationId || selectedConversationId;
      if (!targetId) return;
      setDeleteTargetId(targetId);
    },
    [selectedConversationId]
  );

  const handleConfirmDeleteConversation = useCallback(() => {
    if (!deleteTargetId) return;
    setIsInfoModalOpen(false);
    dispatch(deleteConversation(deleteTargetId));
  }, [deleteTargetId, dispatch]);

  const handleCancelDeleteConversation = useCallback(() => {
    if (deleteStatus === "loading") return;
    setDeleteTargetId(null);
  }, [deleteStatus]);

  const handleViewConversationInfo = useCallback(
    (conversation) => {
      if (!conversation) return;
      const targetUser = resolvePartner(conversation, currentUserId);
      const userId = targetUser?.userId || conversation?.tenant?.userId || conversation?.landlord?.userId;
      if (!userId) {
        showToast("info", "Không tìm thấy thông tin người dùng để hiển thị.");
        return;
      }
      navigate("/users", { state: { highlightUserId: userId } });
    },
    [currentUserId, navigate]
  );

  const landlordUser = selectedConversation?.landlord || null;
  const tenantUser = selectedConversation?.tenant || null;
  const property = selectedConversation?.property || null;

  const isSending = sendStatus === "loading";
  const isUploading = uploadStatus === "loading";

  return (
    <PageShell
      title="Nhắn tin"
      description="Quản lý các cuộc hội thoại với người dùng nền tảng."
      actions={
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4">
            <path
              d="M4 4v6h6M20 20v-6h-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 8a8 8 0 0 0-14.906-3.536M4 16a8 8 0 0 0 14.906 3.536"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Làm mới
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-h-0">
          <PageSection title="Danh sách hội thoại" padded>
            <div className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-slate-600" htmlFor="chat-search">
                    Tìm theo số điện thoại
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                          <path
                            d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <input
                        id="chat-search"
                        type="tel"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Nhập số điện thoại người dùng"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={searchStatus === "loading"}
                    >
                      {searchStatus === "loading" ? "Đang tìm" : "Tìm kiếm"}
                    </button>
                  </div>
                </div>
              <p className="text-xs text-slate-500">
                  Nhập số điện thoại chính xác để mở hội thoại với người dùng.
                </p>
              </form>

              <div className="space-y-3">
                {searchStatus === "loading" && (
                  <div className="space-y-2">
                    {[1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-16 w-full animate-pulse rounded-2xl border border-amber-100 bg-amber-50/60"
                      />
                    ))}
                  </div>
                )}

              {searchStatus === "succeeded" && searchResults.length === 0 && (
                  <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 px-4 py-3 text-xs text-amber-700">
                    Không tìm thấy người dùng với số điện thoại này.
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kết quả người dùng
                    </p>
                    {searchResults.map((user) => {
                      const existingConversation = findConversationByUserId(user.userId);
                      const isActive =
                        selectedPeer?.userId === user.userId ||
                        (existingConversation &&
                          selectedConversationId === existingConversation.conversationId);
                      const displayName = user?.fullName || "Người dùng";
                      const phoneNumber = user?.phoneNumber || "—";
                      const avatarSource = user?.avatarUrl;
                      return (
                        <button
                          key={user.userId || user.phoneNumber || displayName}
                          type="button"
                          onClick={() => handleSelectUserResult(user)}
                          className={`w-full rounded-2xl border px-3 py-3 text-left shadow-sm transition ${
                            isActive
                              ? "border-amber-300 bg-amber-50/80 shadow-md"
                              : "border-transparent bg-white hover:border-amber-200 hover:bg-amber-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 flex-shrink-0">
                              {avatarSource ? (
                                <img
                                  src={resolveAvatarUrl(avatarSource)}
                                  alt={displayName}
                                  className="h-11 w-11 rounded-full border border-white object-cover shadow"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-amber-200 text-sm font-semibold text-amber-800 shadow">
                                  {getInitial(displayName)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
                              <p className="text-xs text-slate-500">{phoneNumber}</p>
                            </div>
                            {existingConversation ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Đã có hội thoại
                              </span>
                            ) : null}
                          </div>
                          </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-[70vh] space-y-2 overflow-y-auto border-t border-slate-100 pt-4 pr-1">
              {conversationsStatus === "loading" && (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-20 w-full animate-pulse rounded-xl border border-amber-100 bg-amber-50/70"
                    />
                  ))}
                </div>
              )}

              {conversationsStatus === "succeeded" && filteredConversations.length === 0 && (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 px-4 py-6 text-center text-sm text-amber-700">
                  Không tìm thấy hội thoại nào phù hợp với từ khóa.
                </div>
              )}

              {conversationsStatus === "succeeded" && filteredConversations.length > 0 && (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => {
                    const participant = resolvePartner(conversation, currentUserId);
                    const lastActivity = conversation.lastActivity;
                    const preview = resolveLastMessagePreview(conversation.lastMessage);
                    const unread = conversation.unread;
                    const isActive = selectedConversationId === conversation.conversationId;
                    const tenantName = conversation?.tenant?.fullName || "—";
                    const landlordName = conversation?.landlord?.fullName || "—";
                    const fallbackName = participant?.fullName || tenantName || landlordName || "?";
                    return (
                      <ConversationListItem
                        key={conversation.conversationId}
                        participant={participant}
                        fallbackName={fallbackName}
                        tenantName={tenantName}
                        landlordName={landlordName}
                        lastActivity={lastActivity}
                        preview={preview}
                        unread={unread}
                        isActive={isActive}
                        onSelect={() => handleSelectConversation(conversation.conversationId)}
                        onViewInfo={() => handleViewConversationInfo(conversation)}
                        onDelete={() => handleDeleteConversation(conversation.conversationId)}
                        isDeleting={
                          deleteStatus === "loading" &&
                          deletingConversationId === conversation.conversationId
                        }
                      />
                    );
                  })}
                </div>
              )}

              {conversationsStatus === "succeeded" && !conversations?.length && (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 px-4 py-6 text-center text-sm text-amber-700">
                  Chưa có cuộc hội thoại nào.
                </div>
              )}
            </div>
          </PageSection>
        </div>

          <div className="min-h-0">
          <PageSection title="Chi tiết hội thoại" padded>
            {!selectedConversation && !selectedPeer && (
              <div className="flex h-[70vh] flex-col items-center justify-center text-center text-slate-500">
                <svg viewBox="0 0 24 24" className="mb-3 h-12 w-12 text-amber-400">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 1 1 8.5 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <p className="text-sm">Hãy chọn một người dùng hoặc hội thoại để bắt đầu nhắn tin.</p>
              </div>
            )}

              {(selectedConversation || selectedPeer) && (
              <div className="flex h-[80vh] min-h-0 flex-col gap-4">
                <ConversationHeader
                  tenant={tenantUser}
                  landlord={landlordUser}
                  partner={selectedConversation ? peerUser : selectedPeer}
                  property={property}
                  onViewInfo={() => setIsInfoModalOpen(true)}
                  onDelete={
                    selectedConversation
                      ? () => handleDeleteConversation(selectedConversation.conversationId)
                      : null
                  }
                  isDeleting={
                    deleteStatus === "loading" &&
                    deletingConversationId === selectedConversationId
                  }
                />

                <div className="relative flex-1 min-h-0 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="flex h-full min-h-0 flex-col overflow-hidden">
                    <div
                      ref={messageListRef}
                      className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
                    >
                      {selectedConversation ? (
                        <>
                          {selectedMessagesError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                              {selectedMessagesError}
                            </div>
                          )}

                          {canLoadMore && (
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={handleLoadMore}
                                disabled={isLoadingOlder || selectedMessagesStatus === "loading"}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 hover:border-amber-200 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isLoadingOlder ? (
                                  <span>Đang tải thêm…</span>
                                ) : (
                                  <span>Xem thêm tin nhắn cũ</span>
                                )}
                              </button>
                            </div>
                          )}

                          {selectedMessagesStatus === "loading" && !selectedMessages.length && (
                            <div className="space-y-3">
                              {[1, 2, 3].map((item) => (
                                <div
                                  key={item}
                                  className="h-16 w-3/4 animate-pulse rounded-2xl bg-white"
                                />
                              ))}
                            </div>
                          )}

                          {selectedMessages.length === 0 && selectedMessagesStatus === "succeeded" && (
                            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
                              Chưa có tin nhắn nào trong hội thoại này.
                            </div>
                          )}

                          {selectedMessages.map((message) => {
                            const isMine = message?.sender?.userId === currentUserId;
                            return (
                              <MessageBubble key={message.messageId} message={message} isMine={isMine} />
                            );
                          })}
                        </>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
                          Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên để tạo hội thoại.
                        </div>
                      )}
                    </div>

                  <form onSubmit={handleSendText} className="border-t border-slate-200 bg-white p-3">
                      <div className="flex items-end gap-2">
                        <label className="relative inline-flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100">
                          <input
                            type="file"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            multiple
                            accept="image/*"
                            onChange={handleUploadImages}
                            disabled={isUploading || isSending || (!selectedConversationId && !selectedPeer)}
                          />
                        <svg viewBox="0 0 24 24" className="h-5 w-5">
                            <path
                              d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M16 9l-4-4-4 4M12 5v12"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </label>

                        <div className="relative" ref={emojiPickerRef}>
                          <button
                            type="button"
                            onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-500 shadow-sm transition hover:bg-amber-50"
                            disabled={isSending}
                          >
                            <span className="text-xl leading-none">😊</span>
                          </button>
                          {isEmojiPickerOpen ? (
                            <div className="absolute bottom-full z-20 mb-3 w-[280px] rounded-2xl border border-amber-100 bg-white p-2 shadow-lg">
                              <EmojiMartPicker onEmojiSelect={handleEmojiSelect} />
                            </div>
                          ) : null}
                        </div>

                        <textarea
                          rows={1}
                          value={messageContent}
                          onChange={(event) => setMessageContent(event.target.value)}
                          placeholder="Nhập tin nhắn..."
                          className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                        />

                        <button
                          type="submit"
                          disabled={
                            isSending ||
                            !messageContent.trim() ||
                            (!selectedConversationId && !selectedPeer)
                          }
                          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
                        >
                          {isSending ? "Đang gửi..." : "Gửi"}
                        </button>
                      </div>

                      {isUploading && (
                        <p className="mt-2 text-xs text-amber-600">Đang tải hình ảnh...</p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}
          </PageSection>

        </div>
      </div>

      {isInfoModalOpen && (
        <ConversationInfoDialog
          conversation={selectedConversation}
          partner={selectedConversation ? peerUser : selectedPeer}
          onClose={() => setIsInfoModalOpen(false)}
        />
      )}

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title="Xóa đoạn chat"
        description="Bạn có chắc chắn muốn xóa đoạn chat này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmVariant="danger"
        loading={
          deleteStatus === "loading" && deleteTargetId === deletingConversationId
        }
        onCancel={handleCancelDeleteConversation}
        onConfirm={handleConfirmDeleteConversation}
      />
    </PageShell>
  );
}

function ConversationListItem({
  participant,
  fallbackName,
  tenantName,
  landlordName,
  lastActivity,
  preview,
  unread,
  isActive,
  onSelect,
  onViewInfo,
  onDelete,
  isDeleting,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const itemRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuContainerRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const updateMenuPosition = useCallback(() => {
    if (!menuButtonRef.current) return;
    if (typeof window === "undefined") return;

    const rect = menuButtonRef.current.getBoundingClientRect();
    const menuWidth = 192; // w-48
    const gap = 8;
    const viewportPadding = 16;

    let left = rect.right - menuWidth;
    const maxLeft = window.innerWidth - viewportPadding - menuWidth;
    left = Math.min(Math.max(left, viewportPadding), maxLeft);

    let top = rect.bottom + gap;

    if (menuContainerRef.current) {
      const { height } = menuContainerRef.current.getBoundingClientRect();
      const maxBottom = window.innerHeight - viewportPadding;
      if (top + height > maxBottom) {
        const aboveTop = rect.top - gap - height;
        if (aboveTop >= viewportPadding) {
          top = aboveTop;
        } else {
          top = Math.max(viewportPadding, maxBottom - height);
        }
      }
    }

    setMenuPosition({ top, left });
  }, []);

  const schedulePositionUpdate = useCallback(() => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        updateMenuPosition();
      });
    } else {
      setTimeout(() => {
        updateMenuPosition();
      }, 0);
    }
  }, [updateMenuPosition]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleClickOutside = (event) => {
      const target = event.target;
      if (itemRef.current?.contains(target) || menuContainerRef.current?.contains(target)) {
        return;
      }
      setIsMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isActive) {
      setIsMenuOpen(false);
    }
  }, [isActive]);

  useLayoutEffect(() => {
    if (!isMenuOpen) {
      setMenuPosition(null);
      return;
    }
    if (typeof window === "undefined") return undefined;

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isMenuOpen, updateMenuPosition]);

  const handleSelectConversation = () => {
    setIsMenuOpen(false);
    setMenuPosition(null);
    onSelect?.();
  };

  return (
    <div
      ref={itemRef}
      className={`relative rounded-2xl border px-3 py-3 shadow-sm transition ${
        isActive
          ? "border-amber-300 bg-amber-50/80 shadow-md"
          : "border-transparent bg-white hover:border-amber-200 hover:bg-amber-50/50"
      }`}
    >
      <button
        type="button"
        onClick={handleSelectConversation}
        className="flex w-full items-start gap-3 pr-8 text-left"
      >
        <div className="relative h-12 w-12 flex-shrink-0">
          {participant?.avatarUrl ? (
            <img
              src={resolveAvatarUrl(participant.avatarUrl)}
              alt={participant?.fullName || "Avatar"}
              className="h-12 w-12 rounded-full border border-white object-cover shadow"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white bg-amber-200 text-sm font-semibold text-amber-800 shadow">
              {getInitial(fallbackName)}
            </div>
          )}
          {unread ? (
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-semibold text-white">
              {unread}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-slate-800">
              {participant?.fullName || tenantName || landlordName}
            </p>
            <span className="whitespace-nowrap text-xs text-slate-500">
              {formatRelativeTime(lastActivity)}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{preview}</p>
        </div>
      </button>

      <div className="absolute right-1.5 top-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsMenuOpen((prev) => !prev);
            if (!isMenuOpen) {
              schedulePositionUpdate();
            }
          }}
          ref={menuButtonRef}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-slate-400 transition hover:border-amber-200 hover:text-amber-600"
        >
          <span className="sr-only">Tùy chọn hội thoại</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </button>

        {isMenuOpen && menuPosition && typeof document !== "undefined"
          ? createPortal(
              <div
                ref={(node) => {
                  menuContainerRef.current = node;
                  if (node) {
                    schedulePositionUpdate();
                  }
                }}
                style={{ top: menuPosition.top, left: menuPosition.left }}
                className="fixed z-50 w-48 rounded-2xl border border-amber-100 bg-white p-2 text-sm shadow-xl"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsMenuOpen(false);
                    setMenuPosition(null);
                    onViewInfo?.();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  <span>Xem thông tin…</span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                      d="M12 5v14m0-14C6.477 5 2 9.477 2 15M12 5c5.523 0 10 4.477 10 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (isDeleting) return;
                    setIsMenuOpen(false);
                    setMenuPosition(null);
                    onDelete?.();
                  }}
                  className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-semibold ${
                    isDeleting
                      ? "cursor-not-allowed bg-slate-100 text-slate-400"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <span>{isDeleting ? "Đang xóa..." : "Xóa đoạn chat"}</span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                      d="M6 7h12M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7m3 4v6m4-6v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>,
              document.body
            )
          : null}
      </div>
    </div>
  );
}

function ConversationHeader({ tenant, landlord, partner, property, onViewInfo, onDelete, isDeleting }) {
  const avatarSource = tenant?.avatarUrl
  const displayName =  tenant?.fullName || "Hội thoại";
  const phoneNumber = tenant?.phoneNumber || "—";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const canDelete = typeof onDelete === "function";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-1 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 flex-shrink-0">
            {avatarSource ? (
              <img
                src={resolveAvatarUrl(avatarSource)}
                alt={displayName}
                className="h-14 w-14 rounded-full border border-white object-cover shadow"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-amber-200 text-base font-semibold text-amber-800 shadow">
                {getInitial(displayName)}
              </div>
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">{displayName}</p>
            <p className="text-sm text-slate-500">{phoneNumber}</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-amber-200 hover:text-amber-600"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>
          {isMenuOpen ? (
            <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-amber-100 bg-white p-2 text-sm shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (canDelete) {
                    onDelete();
                  }
                }}
                disabled={!canDelete || isDeleting}
                className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-semibold ${
                  !canDelete || isDeleting
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "text-red-600 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                <span>{isDeleting ? "Đang xóa..." : "Xóa đoạn chat"}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Zm-7 4v6m4-6v6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {property ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-amber-100 bg-white">
            {property.thumbnailUrl ? (
              <img
                src={resolveAssetUrl(property.thumbnailUrl)}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs text-amber-500">
                Không có ảnh
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-amber-800">{property.title || "Bất động sản"}</p>
            <p className="truncate text-xs text-amber-600">{property.address || "—"}</p>
            <p className="text-sm font-semibold text-amber-700">
              {formatCurrency(property.price)}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MessageBubble({ message, isMine }) {
  const attachments = message?.attachments || [];
  const property = message?.property;
  const senderName = message?.sender?.fullName;
  const createdAt = message?.createdAt;
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm shadow ${
            isMine
              ? "text-slate-800"
              : "bg-white text-slate-700 border border-slate-100"
          }`}
          style={isMine ? { backgroundColor: "#ffe3b8" } : undefined}
        >
          {senderName && !isMine ? (
            <p className="mb-1 text-xs font-semibold text-amber-700">{senderName}</p>
          ) : null}
          {message?.content && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
          )}
          {property ? <SharedProperty property={property} isMine={isMine} /> : null}
          {attachments?.length ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {attachments.map((attachment) => {
                const url = deriveAttachmentUrl(attachment);
                if (!url) return null;
                return (
                  <a
                    key={attachment.attachmentId || attachment.url || url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block overflow-hidden rounded-xl border border-white/60"
                  >
                    <img src={url} alt="Đính kèm" className="h-32 w-full object-cover" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
        <p
          className={`mt-1 text-[11px] ${
            isMine ? "text-amber-400 text-right" : "text-slate-400"
          }`}
        >
          {formatRelativeTime(createdAt)}
        </p>
      </div>
    </div>
  );
}

function ConversationInfoDialog({ conversation, partner, onClose }) {
  const tenant = conversation?.tenant;
  const landlord = conversation?.landlord;
  const property = conversation?.property;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Thông tin hội thoại</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-600"
          >
            <span className="sr-only">Đóng</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path
                d="m7 7 10 10M7 17 17 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          {partner ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Người trò chuyện
              </p>
              <p className="mt-1 text-base font-semibold text-slate-800">{partner.fullName || "Người dùng"}</p>
              <p className="text-sm text-slate-500">{partner.phoneNumber || "—"}</p>
            </div>
          ) : null}

          {tenant ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Người thuê</p>
              <p className="mt-1 font-semibold text-slate-800">{tenant.fullName || "—"}</p>
              <p className="text-sm text-slate-500">{tenant.phoneNumber || "—"}</p>
            </div>
          ) : null}

          {landlord ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chủ nhà</p>
              <p className="mt-1 font-semibold text-slate-800">{landlord.fullName || "—"}</p>
              <p className="text-sm text-slate-500">{landlord.phoneNumber || "—"}</p>
            </div>
          ) : null}

          {property ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Bất động sản</p>
              <p className="mt-1 font-semibold text-amber-800">{property.title || "—"}</p>
              <p className="text-sm text-amber-700">{property.address || "—"}</p>
              {property.price ? (
                <p className="mt-2 text-base font-semibold text-amber-600">
                  {formatCurrency(property.price)}
                </p>
              ) : null}
              {property.thumbnailUrl ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-amber-100">
                  <img
                    src={resolveAssetUrl(property.thumbnailUrl)}
                    alt={property.title || "Bất động sản"}
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {conversation?.conversationId ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mã hội thoại</p>
              <p className="mt-1 font-mono text-sm text-slate-700">{conversation.conversationId}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SharedProperty({ property, isMine }) {
  return (
    <div className={`mt-3 rounded-xl border ${isMine ? "border-amber-200 bg-amber-100/30" : "border-amber-100 bg-amber-50"} p-3`}>
      <p className={`text-sm font-semibold ${isMine ? "text-amber-900" : "text-amber-800"}`}>
        {property?.title || "Bất động sản"}
      </p>
      <p className="text-xs text-amber-700">{property?.address || "—"}</p>
      {property?.price ? (
        <p className="mt-1 text-sm font-semibold text-amber-700">{formatCurrency(property.price)}</p>
      ) : null}
    </div>
  );
}

function resolvePartner(conversation, currentUserId) {
  if (!conversation) return null;
  const { tenant, landlord } = conversation;
  if (tenant?.userId && tenant.userId !== currentUserId) return tenant;
  if (landlord?.userId && landlord.userId !== currentUserId) return landlord;
  return tenant || landlord || null;
}

function resolvePeerId(conversation, currentUserId) {
  const partner = resolvePartner(conversation, currentUserId);
  return partner?.userId;
}

function resolveLastMessagePreview(lastMessage) {
  if (!lastMessage) return "Chưa có tin nhắn";
  if (lastMessage.attachments?.length) {
    const count = lastMessage.attachments.length;
    return count > 1 ? `Đã gửi ${count} hình ảnh` : "Đã gửi 1 hình ảnh";
  }
  if (lastMessage.property?.title) {
    return `Chia sẻ bất động sản: ${lastMessage.property.title}`;
  }
  if (lastMessage.content) return lastMessage.content;
  return "Tin nhắn mới";
}

function formatRelativeTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Vừa gửi";
  if (diff < hour) return `${Math.floor(diff / minute)} phút trước`;
  if (diff < day) return `${Math.floor(diff / hour)} giờ trước`;
  return date.toLocaleDateString("vi-VN");
}

function deriveAttachmentUrl(attachment) {
  if (!attachment) return "";
  const url = attachment.url || attachment.fileUrl || attachment.path;
  return resolveAssetUrl(url);
}

function getInitial(name) {
  if (!name) return "Z";
  const text = String(name).trim();
  if (!text) return "Z";
  return text.charAt(0).toUpperCase();
}