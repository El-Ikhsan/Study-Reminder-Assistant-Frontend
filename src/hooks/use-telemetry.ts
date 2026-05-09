"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

// Simulate realistic sensor data with slight variations
function generateSensorData(prevData?: TelemetryData): TelemetryData {
  const baseTemp = prevData?.temperature ?? 23;
  const baseBrightness = prevData?.brightness ?? 420;
  const baseNoise = prevData?.noise ?? 38;

  return {
    temperature: Math.max(
      18,
      Math.min(30, baseTemp + (Math.random() - 0.5) * 0.8)
    ),
    brightness: Math.max(
      100,
      Math.min(800, baseBrightness + (Math.random() - 0.5) * 30)
    ),
    noise: Math.max(25, Math.min(60, baseNoise + (Math.random() - 0.5) * 4)),
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function useTelemetry(): UseTelemetryReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [currentData, setCurrentData] = useState<TelemetryData>({
    temperature: 23.5,
    brightness: 420,
    noise: 38,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chart data with historical points
  useEffect(() => {
    const now = new Date();
    const initialData: ChartDataPoint[] = [];
    let prevData: TelemetryData | undefined;

    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      const data = generateSensorData(prevData);
      prevData = data;
      initialData.push({
        time: formatTime(time),
        ...data,
      });
    }

    setChartData(initialData);
    setCurrentData(prevData!);
  }, []);

  const updateData = useCallback(() => {
    setCurrentData((prev) => {
      const newData = generateSensorData(prev);
      
      setChartData((prevChart) => {
        const newPoint: ChartDataPoint = {
          time: formatTime(new Date()),
          ...newData,
        };
        const updated = [...prevChart.slice(1), newPoint];
        return updated;
      });

      return newData;
    });
  }, []);

  const connect = useCallback(() => {
    setIsConnected(true);
    // Simulate real-time updates every 2 seconds
    intervalRef.current = setInterval(updateData, 2000);
  }, [updateData]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      connect();
    }, 1000);

    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    currentData,
    chartData,
    isConnected,
    connect,
    disconnect,
  };
}
