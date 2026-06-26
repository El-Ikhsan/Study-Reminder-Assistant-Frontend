"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  RefreshCw,
  Clock,
  MessageSquare,
  AlertTriangle,
  Thermometer,
  Sun,
  Volume2,
  Book,
  Laptop,
  Smartphone,
  Monitor,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Activity,
  Zap,
} from "lucide-react";
import type {
  PomodoroSession,
  PomodoroLog,
  SensorEvent,
  SessionLogData,
} from "@/types/pomodoro";

// Helper functions
// Tabel 4.3: Label tampilan emotion yang bersih
const EMOTION_LABEL: Record<string, string> = {
  IDLE:  "Idle",
  DARK:  "Dark",
  GLARE: "Glare",
  HOT:   "Hot",
  COLD:  "Cold",
  NOISY: "Noisy",
  SMILE: "Smile",
};

const getEmotionLabel = (raw: string) => EMOTION_LABEL[raw] ?? raw;

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getMediaIcon(media: string) {
  switch (media) {
    case "Buku":
      return Book;
    case "Laptop":
      return Laptop;
    case "HP":
      return Smartphone;
    case "Komputer":
      return Monitor;
    default:
      return Laptop;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "running":
      return {
        icon: Play,
        label: "Berjalan",
        className: "bg-emerald-500/20 text-emerald-400",
      };
    case "paused":
      return {
        icon: Pause,
        label: "Dijeda",
        className: "bg-amber-500/20 text-amber-400",
      };
    case "completed":
      return {
        icon: CheckCircle2,
        label: "Selesai",
        className: "bg-sky-500/20 text-sky-400",
      };
    case "stopped":
      return {
        icon: XCircle,
        label: "Dihentikan",
        className: "bg-red-500/20 text-red-400",
      };
    default:
      return {
        icon: Clock,
        label: status,
        className: "bg-muted text-muted-foreground",
      };
  }
}

function getPomodoroModeConfig(mode: string) {
  switch (mode) {
    case "fokus":
      return {
        icon: Activity,
        label: "Fokus",
        className: "bg-sky-500/20 text-sky-400",
      };
    case "istirahat":
      return {
        icon: Clock,
        label: "Istirahat",
        className: "bg-emerald-500/20 text-emerald-400",
      };
    default:
      return {
        icon: Activity,
        label: mode,
        className: "bg-muted text-muted-foreground",
      };
  }
}

function getEventTypeConfig(eventType: string) {
  switch (eventType) {
    case "interupsi":
      return {
        icon: AlertTriangle,
        label: "Interupsi",
        className: "bg-red-500/20 text-red-400",
      };
    case "pemulihan":
      return {
        icon: Zap,
        label: "Pemulihan",
        className: "bg-emerald-500/20 text-emerald-400",
      };
    default:
      return {
        icon: Activity,
        label: eventType,
        className: "bg-muted text-muted-foreground",
      };
  }
}

// Session Log View Component
function SessionLogView({
  data,
  isCurrentSession = false,
  onRefresh,
  isRefreshing = false,
}: {
  data: SessionLogData;
  isCurrentSession?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "logs" | "sensors">("all");

  // Gabungkan dan urutkan data secara kronologis
  const getFilteredItems = () => {
    const logs = data.logs.map((l) => ({ type: "log" as const, data: l, date: l.createdAt ? new Date(l.createdAt).getTime() : 0 }));
    const sensors = data.sensorEvents.map((s) => ({ type: "sensor" as const, data: s, date: s.createdAt ? new Date(s.createdAt).getTime() : 0 }));

    let combined = [...logs, ...sensors];

    if (filter === "logs") combined = logs;
    if (filter === "sensors") combined = sensors;

    return combined.sort((a, b) => a.date - b.date);
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 shadow-sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          <span className="text-xs font-medium">Refresh</span>
        </Button>

        <div className="flex bg-secondary/40 p-1 rounded-lg h-9">
          <button
            onClick={() => setFilter("all")}
            className={cn("px-3 text-xs font-medium rounded-md transition-all", filter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            All
          </button>
          <button
            onClick={() => setFilter("logs")}
            className={cn("px-3 text-xs font-medium rounded-md transition-all", filter === "logs" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setFilter("sensors")}
            className={cn("px-3 text-xs font-medium rounded-md transition-all", filter === "sensors" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Sensor
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4 -mr-4 min-h-0">
        <div className="space-y-3 pb-4">
          {filteredItems.map((item) => {
            if (item.type === "log") {
              const log = item.data as PomodoroLog;
              const config = getPomodoroModeConfig(log.pomodoroMode);
              const LogIcon = config.icon;
              return (
                <div key={log.id} className="glass-panel p-3 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", config.className)}>
                        <LogIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{config.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Siklus {log.currentCycle} - {log.pomodoroMode === "fokus" ? "Fokus" : "Istirahat"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatTime(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.triggerContext}</p>
                  <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                    <p className="text-xs leading-relaxed">{log.aiResponse}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                      {getEmotionLabel(log.emotion)}
                    </span>
                  </div>
                </div>
              );
            }

            if (item.type === "sensor") {
              const event = item.data as SensorEvent;
              const config = getEventTypeConfig(event.eventType);
              const EventIcon = config.icon;
              return (
                <div key={event.id} className="glass-panel p-3 rounded-xl space-y-2 border-l-2 border-l-amber-500/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", config.className)}>
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{config.label}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.triggerContext}</p>
                  <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                    <p className="text-xs leading-relaxed">{event.aiResponse}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Thermometer className="w-3 h-3" />
                      <span>{event.temperatureAtTime}°C</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Sun className="w-3 h-3" />
                      <span>{event.lightAtTime} lux</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Volume2 className="w-3 h-3" />
                      <span>{event.noiseAtTime} dB</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                        {getEmotionLabel(event.emotion)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Activity className="w-8 h-8 opacity-20" />
              <p>Belum ada data untuk filter ini</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Session List Item Component
function SessionListItem({
  session,
  onClick,
  onDelete,
}: {
  session: PomodoroSession;
  onClick: () => void;
  onDelete: (id: string) => void;
}) {
  const MediaIcon = getMediaIcon(session.media);
  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full glass-panel p-3 rounded-xl transition-all duration-200 text-left group",
        "hover:bg-secondary/40",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        "flex items-center justify-between"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MediaIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">Sesi {session.media}</p>
              <div
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                  statusConfig.className
                )}
              >
                <StatusIcon className="w-2.5 h-2.5" />
                {statusConfig.label}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(session.startedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 pl-11 text-[10px] text-muted-foreground">
          <span>Fokus: {session.focusDuration}m</span>
          <span>Istirahat: {session.restDuration}m</span>
          <span>Siklus: {session.targetCycles}x</span>
        </div>
      </div>

      <div className="flex items-center shrink-0 pl-2">
        <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-colors" onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}>
          <Trash2 className="w-6 h-6" />
        </Button>
      </div>
    </button>
  );
}

// Main Component
interface PomodoroLogCardProps {
  currentSessionId: string | null;
}

export function PomodoroLogCard({ currentSessionId }: PomodoroLogCardProps) {
  const [activeView, setActiveView] = useState<"current" | "history">("current");
  const [selectedSession, setSelectedSession] = useState<PomodoroSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const [currentSessionLogs, setCurrentSessionLogs] = useState<SessionLogData>({ logs: [], sensorEvents: [] });
  const [historySessionLogs, setHistorySessionLogs] = useState<SessionLogData | null>(null);

  const [isRefreshingCurrent, setIsRefreshingCurrent] = useState(false);
  const [isLoadingHistoryLogs, setIsLoadingHistoryLogs] = useState(false);

  // Auto-switch to current tab when a session starts
  useEffect(() => {
    if (currentSessionId) {
      setActiveView("current");
      fetchCurrentLogs();
    }
  }, [currentSessionId]);

  const fetchCurrentLogs = useCallback(async () => {
    if (!currentSessionId) return;
    setIsRefreshingCurrent(true);
    try {
      const res = await api.get(`/pomodoro/histories/${currentSessionId}`);
      if (res.data.success) {
        const { pomodoroLogs, sensorLogs } = res.data.data;
        setCurrentSessionLogs({
          logs: pomodoroLogs || [],
          sensorEvents: sensorLogs || []
        });
      }
    } catch (err) {
      console.error("Gagal mengambil log sesi aktif", err);
    } finally {
      setIsRefreshingCurrent(false);
    }
  }, [currentSessionId]);

  const fetchHistorySessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const res = await api.get("/pomodoro/sessions");
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat sesi", err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const fetchHistoryDetails = useCallback(async (sessionId: string) => {
    setIsLoadingHistoryLogs(true);
    try {
      const res = await api.get(`/pomodoro/histories/${sessionId}`);
      if (res.data.success) {
        const { pomodoroLogs, sensorLogs } = res.data.data;
        setHistorySessionLogs({
          logs: pomodoroLogs || [],
          sensorEvents: sensorLogs || []
        });
      }
    } catch (err) {
      console.error("Gagal mengambil detail riwayat", err);
    } finally {
      setIsLoadingHistoryLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === "history") {
      fetchHistorySessions();
    }
  }, [activeView, fetchHistorySessions]);

  useEffect(() => {
    if (selectedSession) {
      fetchHistoryDetails(selectedSession.id);
    } else {
      setHistorySessionLogs(null);
    }
  }, [selectedSession, fetchHistoryDetails]);

  const handleSelectSession = (session: PomodoroSession) => {
    setSelectedSession(session);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      const res = await api.delete(`/pomodoro/histories/${sessionToDelete}`);
      if (res.data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
        if (selectedSession?.id === sessionToDelete) setSelectedSession(null);
      }
    } catch (err) {
      console.error("Gagal menghapus sesi", err);
    } finally {
      setSessionToDelete(null);
    }
  };


  return (
    <div className="glass-panel rounded-2xl p-5 h-[600px] flex flex-col">
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "current" | "history")} className="flex-1 flex flex-col min-h-0">

        {/* Main Header area with integrated TabsList */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold text-lg">Log Pomodoro</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Timeline aktivitas sesi</p>
            </div>
          </div>

          <TabsList className="grid grid-cols-2 bg-secondary/30 p-1 rounded-xl h-10 w-[220px]">
            <TabsTrigger
              value="current"
              className="rounded-lg data-[state=active]:bg-background/80 data-[state=active]:shadow-sm text-xs relative"
            >
              {activeView === "current" && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Active
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg data-[state=active]:bg-background/80 data-[state=active]:shadow-sm text-xs"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current" className="mt-0 flex-1 min-h-0 outline-none">
          {!currentSessionId ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Tidak ada sesi aktif</p>
                <p className="text-xs text-muted-foreground">Mulai sesi Pomodoro untuk melihat log real-time</p>
              </div>
            </div>
          ) : (
            <SessionLogView
              data={currentSessionLogs}
              isCurrentSession={true}
              onRefresh={fetchCurrentLogs}
              isRefreshing={isRefreshingCurrent}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-1 min-h-0 outline-none">
          {!selectedSession ? (
            <ScrollArea className="h-full pr-3 -mr-3">
              <div className="space-y-3 pb-2">
                {isLoadingSessions ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Memuat riwayat...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Belum ada riwayat sesi
                  </div>
                ) : (
                  sessions.map((session) => (
                    <SessionListItem
                      key={session.id}
                      session={session}
                      onClick={() => handleSelectSession(session)}
                      onDelete={(id) => setSessionToDelete(id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col h-full bg-secondary/5 rounded-xl border border-border/40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border/40 bg-secondary/20 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    {(() => {
                      const MediaIcon = getMediaIcon(selectedSession.media);
                      return <MediaIcon className="w-5 h-5 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Sesi {selectedSession.media}</span>
                      {(() => {
                        const statusConfig = getStatusConfig(selectedSession.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                              statusConfig.className
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </div>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(selectedSession.startedAt)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>Fokus: {selectedSession.focusDuration}m</span>
                      <span>Istirahat: {selectedSession.restDuration}m</span>
                      <span>Siklus: {selectedSession.targetCycles}x</span>
                      <span>Media: {selectedSession.media}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                  className="gap-2 border-border/50 hover:bg-secondary/50 h-8"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
              </div>
              <div className="p-4 flex-1 min-h-0">
                {isLoadingHistoryLogs ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : historySessionLogs ? (
                  <SessionLogView data={historySessionLogs} isCurrentSession={false} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Gagal memuat log
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Pomodoro Session</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus sesi Pomodoro ini? Semua data log terkait (Pomodoro Log dan Sensor Log) juga akan ikut terhapus dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}