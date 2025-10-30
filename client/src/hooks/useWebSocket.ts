import { useEffect, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket(onMessage: (message: WebSocketMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Construct WebSocket URL based on current window location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // WebSocket connected
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          // Failed to parse message
        }
      };

      ws.onerror = (error) => {
        // WebSocket error
      };

      ws.onclose = () => {
        // WebSocket disconnected
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    } catch (error) {
      // Failed to create WebSocket
    }
  }, [onMessage]);

  return wsRef;
}
