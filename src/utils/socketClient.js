// src/utils/wsClient.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client;

export function getWsClient(getAccessToken) {
  if (client) return client;

  const WS_URL = "http://localhost:8080/api/ws"; // bạn đang OK với /api/ws/info

  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL, null, {
      transports: ['xhr-streaming','xhr-polling','websocket']
    }),
    debug: (m) => console.log("[STOMP]", m), // bật log tạm
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: () => {
      const token = getAccessToken?.();
      client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    },
  });

  return client;
}
