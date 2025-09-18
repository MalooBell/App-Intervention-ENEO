import { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { useAppStore } from '../store/useAppStore';

export const useWebSocket = (interventionId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const addMessage = useAppStore(state => state.addMessage);

  useEffect(() => {
    if (!interventionId) {
      return;
    }

    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
      (window.location.protocol === "https:" ? "wss:" : "ws:") + "//" + window.location.host;
    
    const wsUrl = `${WS_BASE_URL}/ws/chat/${interventionId}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected for intervention:', interventionId);
        setIsConnected(true);
        setError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          addMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
        setIsConnected(false);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect');
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      setIsConnected(false);
      setError(null);
    };
  }, [interventionId, addMessage]);

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  return {
    isConnected,
    error,
    disconnect
  };
};
