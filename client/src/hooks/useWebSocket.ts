import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { buildWebSocketUrl } from '@/lib/api-url';

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
    if (!window.location.host) return; // Safety check
    
    const wsUrl = buildWebSocketUrl();

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
        setIsConnected(false);
        ws.close();
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        // Reconnect after 30 seconds only (not 5 to reduce load)
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 30000);
      };
    } catch (error) {
      setIsConnected(false);
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
