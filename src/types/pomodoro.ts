"use client";

export interface PomodoroSession {
  id: string;
  deviceId: string;
  focusDuration: number;
  restDuration: number;
  targetCycles: number;
  media: "Buku" | "Laptop" | "HP" | "Komputer";
  currentCycle: number;
  currentMode: "fokus" | "istirahat";
  currentPhase: "awal" | "tengah" | "akhir";
  status: "running" | "paused" | "completed" | "cancelled";
  startedAt: string;
  endedAt: string | null;
}

export interface PomodoroLog {
  id: string;
  sessionId: string;
  logType: "phase_alert" | "voice_chat" | "system_alert";
  currentCycle: number;
  pomodoroMode: "fokus" | "istirahat";
  triggerContext: string;
  aiResponse: string;
  emotion: string;
  createdAt: string;
}

export interface SensorEvent {
  id: string;
  sessionId: string;
  eventType: "interupsi" | "pemulihan";
  triggerContext: string;
  aiResponse: string;
  emotion: string;
  temperatureAtTime: number;
  lightAtTime: number;
  noiseAtTime: number;
  createdAt: string;
}

export interface SessionLogData {
  logs: PomodoroLog[];
  sensorEvents: SensorEvent[];
}
