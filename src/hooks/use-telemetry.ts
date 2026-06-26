"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAccessToken } from "@/lib/api";

interface TelemetryData {
  temperature: number;
  brightness: number;
  noise: number;
}

interface ChartDataPoint {
  time: string;       // label "HH:MM"
  temperature: number;
  brightness: number;
  noise: number;
}

// Bucket akumulasi untuk rata-rata per menit
interface MinuteBucket {
  minuteKey: string;  // "HH:MM" — kunci unik per menit
  sumTemp: number;
  sumBright: number;
  sumNoise: number;
  count: number;
}

interface UseTelemetryReturn {
  currentData: TelemetryData;
  chartData: ChartDataPoint[];
  isConnected: boolean;
  isDataActive: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WS_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api")
  .replace("http://", "ws://")
  .replace("https://", "wss://");

function formatMinuteKey(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Buat 30 slot kosong mewakili 30 menit ke belakang dari sekarang */
function buildEmptyHistory(): ChartDataPoint[] {
  return Array.from({ length: 30 }, (_, i) => ({
    time: formatMinuteKey(new Date(Date.now() - (29 - i) * 60_000)),
    temperature: 0,
    brightness: 0,
    noise: 0,
  }));
}

export function useTelemetry(deviceId: string): UseTelemetryReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isDataActive, setIsDataActive] = useState(false);
  const [currentData, setCurrentData] = useState<TelemetryData>({
    temperature: 0,
    brightness: 0,
    noise: 0,
  });

  // Chart dimulai dengan 30 slot kosong (30 menit ke belakang)
  const [chartData, setChartData] = useState<ChartDataPoint[]>(buildEmptyHistory);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTelemetryTimeRef = useRef<number>(0);

  // Bucket menit saat ini (diakumulasi, belum di-commit ke chart)
  const currentBucketRef = useRef<MinuteBucket | null>(null);

  /** Commit bucket saat ini ke chartData (geser window 30 menit) */
  const flushBucket = useCallback((bucket: MinuteBucket) => {
    const avg: ChartDataPoint = {
      time: bucket.minuteKey,
      temperature: Math.round((bucket.sumTemp / bucket.count) * 10) / 10,
      brightness: Math.round(bucket.sumBright / bucket.count),
      noise: Math.round((bucket.sumNoise / bucket.count) * 10) / 10,
    };
    setChartData((prev) => {
      // Jika slot terakhir sudah punya minuteKey yang sama, timpa (update)
      if (prev.length > 0 && prev[prev.length - 1].time === avg.time) {
        return [...prev.slice(0, -1), avg];
      }
      // Slot baru: geser window, buang yang paling lama, tambah yang baru
      return [...prev.slice(-29), avg];
    });
  }, []);

  /** Proses satu paket telemetri mentah dari WebSocket */
  const processTelemetry = useCallback((raw: TelemetryData) => {
    const now = new Date();
    const minuteKey = formatMinuteKey(now);

    if (
      currentBucketRef.current &&
      currentBucketRef.current.minuteKey === minuteKey
    ) {
      // Masih dalam menit yang sama — akumulasi
      currentBucketRef.current.sumTemp += raw.temperature;
      currentBucketRef.current.sumBright += raw.brightness;
      currentBucketRef.current.sumNoise += raw.noise;
      currentBucketRef.current.count += 1;
    } else {
      // Menit baru — commit bucket lama (jika ada), buka bucket baru
      if (currentBucketRef.current) {
        flushBucket(currentBucketRef.current);
      }
      currentBucketRef.current = {
        minuteKey,
        sumTemp: raw.temperature,
        sumBright: raw.brightness,
        sumNoise: raw.noise,
        count: 1,
      };
    }

    // Juga live-update chart untuk menit yang sedang berjalan
    // (nilai rata-rata sementara, akan diperbarui terus sampai menit berganti)
    if (currentBucketRef.current) {
      flushBucket(currentBucketRef.current);
    }
  }, [flushBucket]);

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

          // 1. Update nilai current (card sensor) secara instan
          setCurrentData(newData);
          setIsDataActive(true);
          lastTelemetryTimeRef.current = Date.now();

          // 2. Masukkan ke bucket menit (bukan push langsung ke chart)
          processTelemetry(newData);
        }
      } catch (err) {
        console.error("Gagal parse message WebSocket", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      setIsDataActive(false);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error", err);
      ws.close();
    };
  }, [deviceId, processTelemetry]);

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
    setIsDataActive(false);
    lastTelemetryTimeRef.current = 0;
    currentBucketRef.current = null;
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

  // Monitor timeout telemetri (60 detik tanpa data = offline)
  useEffect(() => {
    const timeoutCheck = setInterval(() => {
      if (lastTelemetryTimeRef.current > 0 && Date.now() - lastTelemetryTimeRef.current > 60000) {
        setIsDataActive(false);
      }
    }, 5000);

    return () => clearInterval(timeoutCheck);
  }, []);

  return {
    currentData,
    chartData,
    isConnected,
    isDataActive,
    connect,
    disconnect,
  };
}
