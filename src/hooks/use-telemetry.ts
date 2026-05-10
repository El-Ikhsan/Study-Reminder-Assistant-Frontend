"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAccessToken } from "@/lib/api";

interface TelemetryData {
  temperature: number;
  brightness: number;
  noise: number;
}

interface ChartDataPoint {
  time: string;
  temperature: number;
  brightness: number;
  noise: number;
}

interface UseTelemetryReturn {
  currentData: TelemetryData;
  chartData: ChartDataPoint[];
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WS_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api")
  .replace("http://", "ws://")
  .replace("https://", "wss://");

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function useTelemetry(deviceId: string): UseTelemetryReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [currentData, setCurrentData] = useState<TelemetryData>({
    temperature: 0,
    brightness: 0,
    noise: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!deviceId) return;
    
    const token = getAccessToken();
    if (!token) return;

    const wsUrl = `${WS_BASE_URL}/ws/web?token=${token}&deviceId=${deviceId}`;
    console.log("Connecting to WebSocket:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      if (event.data === "pong") return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === "TELEMETRY_UPDATE") {
          const payload = data.payload;
          const newData: TelemetryData = {
            temperature: payload.temperature,
            brightness: payload.lightLux,
            noise: payload.noiseLevel,
          };

          setCurrentData(newData);
          
          setChartData((prevChart) => {
            const newPoint: ChartDataPoint = {
              time: formatTime(new Date()),
              ...newData,
            };
            const updated = [...prevChart.slice(-29), newPoint];
            return updated;
          });
        }
      } catch (err) {
        console.error("Gagal parse message WebSocket", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error", err);
      ws.close();
    };
  }, [deviceId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Initialize chart data with 30 empty points if none exist
  useEffect(() => {
    if (chartData.length === 0) {
      const emptyData: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
        time: formatTime(new Date(Date.now() - (29 - i) * 60000)),
        temperature: 0,
        brightness: 0,
        noise: 0,
      }));
      setChartData(emptyData);
    }
  }, []);

  // Auto-connect when deviceId changes
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect, deviceId]);

  // Keep-alive ping
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send("ping");
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, []);

  return {
    currentData,
    chartData,
    isConnected,
    connect,
    disconnect,
  };
}
