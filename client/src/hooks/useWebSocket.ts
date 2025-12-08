import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: string;
  data?: any;
  restaurantId?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

export function useWebSocket(onMessage?: MessageHandler) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);
  
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (user?.restaurantId) {
          ws.send(JSON.stringify({ 
            type: 'auth', 
            restaurantId: user.restaurantId 
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(message);
          }
        } catch (error) {
          // Failed to parse message
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (error) {
      // Failed to create WebSocket
    }
  }, [user?.restaurantId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    ws: wsRef,
    isConnected,
    sendMessage,
  };
}
