"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { addRinchanLog } from "@/lib/logger";

type SessionType = "focus" | "break";
type LearningMedia = "book" | "laptop" | "phone" | "computer";

interface PomodoroSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  totalCycles: number;
  learningMedia: LearningMedia;
}

interface UsePomodoroReturn {
  isRunning: boolean;
  timeLeft: number;
  sessionType: SessionType;
  currentCycle: number;
  sessionsCompleted: number;
  settings: PomodoroSettings;
  isComplete: boolean;
  sessionId: string | null;
  toggle: () => void;
  reset: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  breakDuration: 5,
  totalCycles: 4,
  learningMedia: "laptop",
};

export function usePomodoro(deviceId: string): UsePomodoroReturn {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rinchan_pomodoro_settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Gagal membaca pomodoro settings", e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isComplete) return;
    
    if (!isRunning) {
      // Start session via API
      try {
        const mediaFormatted = settings.learningMedia.charAt(0).toUpperCase() + settings.learningMedia.slice(1);
        const res = await api.post("/pomodoro/start", {
          deviceId,
          recipe: {
            focusDuration: settings.focusDuration,
            breakDuration: settings.breakDuration,
            cycles: settings.totalCycles,
            media: mediaFormatted === "Phone" ? "HP" : mediaFormatted === "Computer" ? "Komputer" : mediaFormatted === "Book" ? "Buku" : "Laptop",
            currentCycle: currentCycle,
            currentMode: sessionType === "focus" ? "fokus" : "istirahat",
            currentPhase: "awal",
            status: "running"
          }
        });
        if (res.data.success && res.data.sessionId) {
          setSessionId(res.data.sessionId);
          
          // ✨ Sinkronisasi Waktu Akurat:
          // Gunakan waktu mulai eksak dari server (setelah ESP32 mengirim ACK)
          if (res.data.startedAt) {
            const exactStartTime = new Date(res.data.startedAt).getTime();
            const elapsedSeconds = Math.floor((Date.now() - exactStartTime) / 1000);
            const totalSeconds = sessionType === "focus" ? settings.focusDuration * 60 : settings.breakDuration * 60;
            const newTimeLeft = Math.max(0, totalSeconds - elapsedSeconds);
            setTimeLeft(newTimeLeft);
          }
          
          // Mulai timer UI HANYA JIKA API berhasil (device online & merespons)
          setIsRunning(true);
          addRinchanLog("Sesi Pomodoro Dimulai", "Selamat fokus! Timer telah disinkronisasi dengan perangkat.", "success");
        }
      } catch (err: any) {
        console.error("Gagal memulai pomodoro", err);
        addRinchanLog("Gagal Memulai Sesi", err.response?.data?.message || "Gagal menghubungi perangkat.", "warning");
      }
    } else {
      if (sessionId) {
        try {
          await api.post("/pomodoro/stop", { sessionId, deviceId });
          addRinchanLog("Sesi Dibatalkan", "Sesi Pomodoro berhasil dihentikan.", "warning");
        } catch (err: any) {
          console.error("Gagal menghentikan pomodoro", err);
          addRinchanLog("Gagal Menghentikan Sesi", err.response?.data?.message || "Terjadi kesalahan sistem.", "warning");
        }
        setSessionId(null);
      }
      setIsRunning(false);
    }
  }, [isComplete, isRunning, deviceId, settings, currentCycle, sessionType, sessionId]);

  const reset = useCallback(async () => {
    if (sessionId) {
      try {
        await api.post("/pomodoro/stop", { sessionId, deviceId });
        addRinchanLog("Sesi Direset", "Sesi saat ini dibatalkan dan dikembalikan ke awal.", "warning");
      } catch (err: any) {
        console.error("Gagal reset pomodoro", err);
        addRinchanLog("Gagal Reset Sesi", err.response?.data?.message || "Terjadi kesalahan.", "warning");
      }
      setSessionId(null);
    }
    clearTimer();
    setIsRunning(false);
    setSessionType("focus");
    setCurrentCycle(1);
    setTimeLeft(settings.focusDuration * 60);
    setIsComplete(false);
  }, [settings.focusDuration, clearTimer, sessionId, deviceId]);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== "undefined") {
        localStorage.setItem("rinchan_pomodoro_settings", JSON.stringify(updated));
      }
      // Reset timer when settings change
      if (newSettings.focusDuration !== undefined || newSettings.breakDuration !== undefined) {
        clearTimer();
        setIsRunning(false);
        setSessionType("focus");
        setCurrentCycle(1);
        setTimeLeft(updated.focusDuration * 60);
        setIsComplete(false);
      }
      return updated;
    });
  }, [clearTimer]);

  // Timer logic with auto-switch between focus and break
  useEffect(() => {
    if (isRunning && !isComplete) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Session complete
            if (sessionType === "focus") {
              // Switch to break
              setSessionType("break");
              return settings.breakDuration * 60;
            } else {
              // Break finished, move to next focus cycle
              setSessionsCompleted((s) => s + 1);
              
              // Check if all cycles are done
              if (currentCycle >= settings.totalCycles) {
                clearTimer();
                setIsRunning(false);
                setIsComplete(true);
                return 0;
              }
              
              setCurrentCycle((c) => c + 1);
              setSessionType("focus");
              return settings.focusDuration * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [isRunning, sessionType, currentCycle, settings, clearTimer, isComplete]);

  return {
    isRunning,
    timeLeft,
    sessionType,
    currentCycle,
    sessionsCompleted,
    settings,
    isComplete,
    sessionId,
    toggle,
    reset,
    updateSettings,
  };
}
