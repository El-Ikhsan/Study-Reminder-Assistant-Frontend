"use client";

import { useState } from "react";
import {
  History,
  Clock,
  Book,
  Laptop,
  Smartphone,
  Monitor,
  ChevronRight,
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { PomodoroSession } from "@/types/pomodoro";
import { SessionLogDialog } from "./session-log-dialog";

interface SessionHistoryProps {
  sessions: PomodoroSession[];
  onSelectSession: (sessionId: string) => void;
}

const MEDIA_ICONS = {
  Buku: Book,
  Laptop: Laptop,
  HP: Smartphone,
  Komputer: Monitor,
};

const STATUS_CONFIG = {
  running: {
    icon: PlayCircle,
    label: "Berjalan",
    className: "text-primary bg-primary/10",
  },
  completed: {
    icon: CheckCircle2,
    label: "Selesai",
    className: "text-success bg-success/10",
  },
  stopped: {
    icon: XCircle,
    label: "Dihentikan",
    className: "text-destructive bg-destructive/10",
  },
};

export function SessionHistory({ sessions = [], onSelectSession }: SessionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDuration = (focusDuration: number, targetCycles: number) => {
    const totalMinutes = focusDuration * targetCycles;
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}j ${mins}m`;
    }
    return `${totalMinutes}m`;
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsLogDialogOpen(true);
    onSelectSession(sessionId);
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Riwayat</span>
            {sessions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {sessions.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="glass-panel border-l-border/50 w-full sm:max-w-md">
          <SheetHeader className="pb-4 border-b border-border/50">
            <SheetTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <History className="w-5 h-5 text-primary" />
              </div>
              Riwayat Sesi Pomodoro
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-2xl bg-secondary/30 mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Belum ada sesi pomodoro</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Mulai sesi fokus pertamamu!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const MediaIcon = MEDIA_ICONS[session.media];
                  const statusConfig = STATUS_CONFIG[session.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <button
                      key={session.id}
                      onClick={() => handleSessionClick(session.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all",
                        "bg-secondary/30 hover:bg-secondary/50 border border-border/50",
                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                        "group"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Media Icon */}
                          <div className="p-2.5 rounded-xl bg-secondary/50 shrink-0">
                            <MediaIcon className="w-5 h-5 text-muted-foreground" />
                          </div>

                          {/* Session Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                Sesi {session.media}
                              </span>
                              <div
                                className={cn(
                                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                                  statusConfig.className
                                )}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2 truncate">
                              {formatDate(session.startedAt)}
                            </p>

                            {/* Session Stats */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {session.focusDuration}m fokus
                              </span>
                              <span className="text-border/80">|</span>
                              <span>{session.restDuration}m istirahat</span>
                              <span className="text-border/80">|</span>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                {session.targetCycles}x
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Session Log Dialog */}
      {selectedSession && (
        <SessionLogDialog
          open={isLogDialogOpen}
          onOpenChange={setIsLogDialogOpen}
          session={selectedSession}
        />
      )}
    </>
  );
}
