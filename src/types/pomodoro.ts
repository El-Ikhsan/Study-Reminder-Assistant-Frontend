"use client";

export interface PomodoroSession {
  id: string;
  deviceId: string;
  focusDuration: number;
  restDuration: number;
  targetCycles: number;
  media: "Buku" | "Laptop" | "HP" | "Komputer";
  status: "running" | "completed" | "stopped";
  startedAt: string;
  endedAt: string | null;
}

export interface PomodoroLog {
  id: string;
  sessionId: string;
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
