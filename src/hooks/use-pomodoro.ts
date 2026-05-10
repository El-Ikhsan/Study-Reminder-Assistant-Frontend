"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

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
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
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
        }
      } catch (err) {
        console.error("Gagal memulai pomodoro", err);
        // Fallback to local if API fails or device offline?
      }
    } else {
      // Pause or stop? API doc says POST /api/pomodoro/stop for cancel.
      // Usually toggle means pause, but the API doc only has start and stop.
      // If we are stopping it:
      if (sessionId) {
        try {
          await api.post("/pomodoro/stop", { sessionId, deviceId });
        } catch (err) {
          console.error("Gagal menghentikan pomodoro", err);
        }
        setSessionId(null);
      }
    }
    
    setIsRunning((prev) => !prev);
  }, [isComplete, isRunning, deviceId, settings, currentCycle, sessionType, sessionId]);

  const reset = useCallback(async () => {
    if (sessionId) {
      try {
        await api.post("/pomodoro/stop", { sessionId, deviceId });
      } catch (err) {
        console.error("Gagal reset pomodoro", err);
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
              setSessionsCompleted((s) => s + 1);
              
              // Check if all cycles are done
              if (currentCycle >= settings.totalCycles) {
                clearTimer();
                setIsRunning(false);
                setIsComplete(true);
                return 0;
              }
              
              // Switch to break
              setSessionType("break");
              return settings.breakDuration * 60;
            } else {
              // Break finished, move to next focus cycle
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
