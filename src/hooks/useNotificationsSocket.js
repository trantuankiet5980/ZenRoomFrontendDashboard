// src/hooks/useNotificationsSocket.js
import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch, useSelector } from "react-redux";
import { wsConnected, wsDisconnected, wsUpsert } from "../redux/slices/notificationsSlice";
import { showToast } from "../utils/toast";

export default function useNotificationsSocket() {
  const dispatch = useDispatch();
  const { accessToken, role } = useSelector(s => s.auth);
  const clientRef = useRef(null);

  useEffect(() => {
    // chỉ kết nối khi đã đăng nhập & là admin
    if (!accessToken || role !== "admin") return;

    const WS_BASE = process.env.REACT_APP_WS_BASE || "http://localhost:8080";
    // Dùng SockJS endpoint /ws (khớp BE)
    const socketFactory = () => new SockJS(`${WS_BASE}/ws`);
    const client = new Client({
      // WebSocket over SockJS
      webSocketFactory: socketFactory,
      // Heartbeat (ms)
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      // Reconnect
      reconnectDelay: 3000,
      // Pass JWT qua STOMP header để BE nhận diện (nếu có interceptor)
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      // debug: (str) => console.log("[STOMP]", str), // tắt log; cần debug thì console.log
      onConnect: () => {
        dispatch(wsConnected());

        // Sub topic broadcast cho admin
        const sub = client.subscribe("/topic/admin.notifications", (message) => {
          try {
            console.log("[STOMP] message", message.body);
            const body = JSON.parse(message.body);
            // body có thể là 1 object hoặc mảng; wsUpsert đã xử lý cả 2
            dispatch(wsUpsert(body));

            const item = Array.isArray(body) ? body[0] : body;
            const type = item?.type;
            const title = item?.title || "Bài đăng";

            if (type === "PROPERTY_CREATED" || type === "PROPERTY_UPDATED") {
              // bài mới / vừa cập nhật -> cần duyệt
              showToast("info", `🔔 "${title}" cần được duyệt`);
            } else if (type === "PROPERTY_STATUS_CHANGED") {
              // admin đổi trạng thái
              const st = String(item?.status || "").toLowerCase(); // approved | rejected | pending ...
              const reason = item?.rejectedReason ? ` (Lý do: ${item.rejectedReason})` : "";
              const human =
                st === "approved" ? "đã được DUYỆT" :
                st === "rejected" ? "BỊ TỪ CHỐI" :
                "đang CHỜ DUYỆT";
              showToast("info", `🔔 "${title}" ${human}${reason}`);
            } else {
              // fallback
              showToast("info", `🔔 ${title}`);
            }
          } catch (e) {
            // ignore parse errors
          }
        });

        clientRef.current = { client, sub };
      },
      onStompError: () => {
        dispatch(wsDisconnected());
      },
      onWebSocketClose: () => {
        dispatch(wsDisconnected());
      },
    });

    client.activate();

    return () => {
      try {
        if (clientRef.current?.sub) clientRef.current.sub.unsubscribe();
        if (client.active) client.deactivate();
      } catch (_) {}
      dispatch(wsDisconnected());
    };
  }, [accessToken, role, dispatch]);
}
