import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import {
  wsReceiveMessage,
  wsUpdateInbox,
  wsMessageRead,
  wsConversationReadAll,
} from "../redux/slices/chatSlice";

function safeJsonParse(body) {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch (error) {
    return null;
  }
}

export default function useChatSocket() {
  const dispatch = useDispatch();
  const { accessToken, userId } = useSelector((state) => state.auth);
  const conversations = useSelector((state) => state.chat.conversations || []);

  const conversationIds = useMemo(
    () => conversations.map((item) => item?.conversationId).filter(Boolean),
    [conversations]
  );

  const clientRef = useRef(null);
  const inboxSubRef = useRef(null);
  const conversationSubsRef = useRef({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!accessToken) return undefined;

    const WS_BASE = process.env.REACT_APP_WS_BASE || "http://localhost:8080";
    const socketFactory = () => new SockJS(`${WS_BASE}/ws`);

    const client = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 3000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (message) => console.debug("[CHAT][WS]", message),
      onConnect: () => {
        setConnected(true);

        inboxSubRef.current = client.subscribe("/user/queue/chat.inbox", (frame) => {
          const parsed = safeJsonParse(frame?.body);
          if (!parsed) return;
          if (Array.isArray(parsed)) {
            parsed.forEach((event) => {
              if (event) dispatch(wsUpdateInbox(event));
            });
          } else {
            dispatch(wsUpdateInbox(parsed));
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: () => {
        setConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      setConnected(false);

      Object.values(conversationSubsRef.current).forEach((subs) => {
        subs?.message?.unsubscribe?.();
        subs?.read?.unsubscribe?.();
        subs?.readAll?.unsubscribe?.();
      });
      conversationSubsRef.current = {};

      if (inboxSubRef.current) {
        inboxSubRef.current.unsubscribe();
        inboxSubRef.current = null;
      }

      const currentClient = clientRef.current;
      if (currentClient?.active) {
        try {
          currentClient.deactivate();
        } catch (_) {
          // ignore deactivate error
        }
      }
      clientRef.current = null;
    };
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (!connected) return undefined;
    const client = clientRef.current;
    if (!client || !client.connected) return undefined;

    const currentSubs = conversationSubsRef.current;

    conversationIds.forEach((conversationId) => {
      if (!conversationId) return;
      if (currentSubs[conversationId]) return;

      const messageSub = client.subscribe(`/topic/chat.${conversationId}`, (frame) => {
        const parsed = safeJsonParse(frame?.body);
        if (!parsed) return;
        dispatch(wsReceiveMessage(parsed));
      });

      const readSub = client.subscribe(`/topic/chat.${conversationId}.read`, (frame) => {
        const body = frame?.body?.trim();
        if (!body) return;
        const parsed = safeJsonParse(body);
        const messageId = typeof parsed === "string" ? parsed : body;
        if (!messageId) return;
        dispatch(wsMessageRead({ conversationId, messageId }));
      });

      const readAllSub = client.subscribe(`/topic/chat.${conversationId}.read-all`, (frame) => {
        const body = frame?.body?.trim();
        if (!body) return;
        const parsed = safeJsonParse(body);
        const readerId = typeof parsed === "string" ? parsed : body;
        if (!readerId) return;
        dispatch(wsConversationReadAll({ conversationId, readerId, isSelf: readerId === userId }));
      });

      currentSubs[conversationId] = {
        message: messageSub,
        read: readSub,
        readAll: readAllSub,
      };
    });

    Object.keys(currentSubs).forEach((conversationId) => {
      if (conversationIds.includes(conversationId)) return;
      const subs = currentSubs[conversationId];
      subs?.message?.unsubscribe?.();
      subs?.read?.unsubscribe?.();
      subs?.readAll?.unsubscribe?.();
      delete currentSubs[conversationId];
    });

    return undefined;
  }, [conversationIds, connected, dispatch, userId]);
}