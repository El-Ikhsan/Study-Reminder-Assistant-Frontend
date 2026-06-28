"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { addRinchanLog } from "@/lib/logger";

type SessionType = "focus" | "break";
type LearningMedia = "book" | "laptop" | "phone" | "computer";

// Mapping antara format frontend (lowercase) dan backend (format DB)
const MEDIA_TO_DB: Record<LearningMedia, string> = {
  book: "Buku",
  laptop: "Laptop",
  phone: "HP",
  computer: "Komputer",
};

const MEDIA_FROM_DB: Record<string, LearningMedia> = {
  Buku: "book",
  Laptop: "laptop",
  HP: "phone",
  Komputer: "computer",
};

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
  isLoadingPrefs: boolean;
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
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration * 60);
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferensi dari database saat pertama kali mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await api.get("/preferences/pomodoro");
        if (res.data.success) {
          const prefs = res.data.data.preferences;
          const loaded: PomodoroSettings = {
            focusDuration: prefs.focusDuration,
            breakDuration: prefs.breakDuration,
            totalCycles: prefs.totalCycles,
            learningMedia: MEDIA_FROM_DB[prefs.learningMedia] ?? "laptop",
          };
          setSettings(loaded);
          setTimeLeft(loaded.focusDuration * 60);
        }
      } catch (err) {
        console.warn("Gagal memuat preferensi pomodoro dari server, menggunakan default.", err);
        // Fallback ke default — tidak perlu pesan error ke user karena tidak kritis
      } finally {
        setIsLoadingPrefs(false);
      }
    };

    loadPreferences();
  }, []);

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
        const mediaDb = MEDIA_TO_DB[settings.learningMedia];
        const res = await api.post("/pomodoro/start", {
          deviceId,
          recipe: {
            focusDuration: settings.focusDuration,
            breakDuration: settings.breakDuration,
            cycles: settings.totalCycles,
            media: mediaDb,
            currentCycle: currentCycle,
            currentMode: sessionType === "focus" ? "fokus" : "istirahat",
            currentPhase: "awal",
            status: "running",
          },
        });
        if (res.data.success && res.data.sessionId) {
          setSessionId(res.data.sessionId);

          // ✨ Sinkronisasi Waktu Akurat:
          // Gunakan waktu mulai eksak dari server (setelah ESP32 mengirim ACK)
          if (res.data.startedAt) {
            const exactStartTime = new Date(res.data.startedAt).getTime();
            const elapsedSeconds = Math.floor((Date.now() - exactStartTime) / 1000);
            const totalSeconds =
              sessionType === "focus"
                ? settings.focusDuration * 60
                : settings.breakDuration * 60;
            const newTimeLeft = Math.max(0, totalSeconds - elapsedSeconds);
            setTimeLeft(newTimeLeft);
          }

          // Mulai timer UI HANYA JIKA API berhasil (device online & merespons)
          setIsRunning(true);
          addRinchanLog(
            "Sesi Pomodoro Dimulai",
            "Selamat fokus! Timer telah disinkronisasi dengan perangkat.",
            "success"
          );
        }
      } catch (err: any) {
        console.error("Gagal memulai pomodoro", err);
        addRinchanLog(
          "Gagal Memulai Sesi",
          err.response?.data?.message || "Gagal menghubungi perangkat.",
          "warning"
        );
      }
    } else {
      if (sessionId) {
        try {
          await api.post("/pomodoro/stop", { sessionId, deviceId });
          addRinchanLog("Sesi Dibatalkan", "Sesi Pomodoro berhasil dihentikan.", "warning");
        } catch (err: any) {
          console.error("Gagal menghentikan pomodoro", err);
          addRinchanLog(
            "Gagal Menghentikan Sesi",
            err.response?.data?.message || "Terjadi kesalahan sistem.",
            "warning"
          );
        }
        setSessionId(null);
      }
      setIsRunning(false);
    }
  }, [isComplete, isRunning, deviceId, settings, currentCycle, sessionType, sessionId]);

  const reset = useCallback(() => {
    setSessionId(null);
    clearTimer();
    setIsRunning(false);
    setSessionType("focus");
    setCurrentCycle(1);
    setTimeLeft(settings.focusDuration * 60);
    setIsComplete(false);
  }, [settings.focusDuration, clearTimer]);

  const updateSettings = useCallback(
    async (newSettings: Partial<PomodoroSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };

        // Reset timer ketika durasi berubah
        if (
          newSettings.focusDuration !== undefined ||
          newSettings.breakDuration !== undefined
        ) {
          clearTimer();
          setIsRunning(false);
          setSessionType("focus");
          setCurrentCycle(1);
          setTimeLeft(updated.focusDuration * 60);
          setIsComplete(false);
        }

        return updated;
      });

      // Simpan ke database (fire-and-forget — tidak block UI)
      try {
        const payload: Record<string, unknown> = {};
        if (newSettings.focusDuration !== undefined) payload.focusDuration = newSettings.focusDuration;
        if (newSettings.breakDuration !== undefined) payload.breakDuration = newSettings.breakDuration;
        if (newSettings.totalCycles !== undefined) payload.totalCycles = newSettings.totalCycles;
        if (newSettings.learningMedia !== undefined) payload.learningMedia = MEDIA_TO_DB[newSettings.learningMedia];

        if (Object.keys(payload).length > 0) {
          await api.patch("/preferences/pomodoro", payload);
        }
      } catch (err) {
        console.warn("Gagal menyimpan preferensi ke server:", err);
      }
    },
    [clearTimer]
  );

  // Timer logic with auto-switch between focus and break
  useEffect(() => {
    if (isRunning && !isComplete) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (sessionType === "focus") {
              // ✨ LOGIKA BARU: Cek apakah ini siklus fokus TERAKHIR
              // Jika iya, sesi langsung selesai TANPA fase istirahat
              if (currentCycle >= settings.totalCycles) {
                clearTimer();
                setIsRunning(false);
                setIsComplete(true);
                setSessionsCompleted((s) => s + 1);
                return 0;
              }
              // Masih ada siklus berikutnya — masuk ke istirahat
              setSessionType("break");
              return settings.breakDuration * 60;
            } else {
              // Istirahat selesai — naikkan siklus dan mulai fokus berikutnya
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
    isLoadingPrefs,
    toggle,
    reset,
    updateSettings,
  };
}
