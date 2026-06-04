"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Unplug,
  Bell,
  Settings,
  Clock,
  ChevronDown,
  Menu,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SettingsSheet } from "./settings-sheet";
import { ProfilePanel } from "./profile-panel";
import { useToast } from "@/hooks/use-toast";

export interface LogItemData {
  title: string;
  description: string;
  type: "warning" | "success";
  timestamp: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  location: string;
  organization: string;
  avatarUrl: string | null;
}

interface StatusBarProps {
  isConnected: boolean;
  currentTime: Date;
  user: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onAvatarUpload: (file: File) => void;
  onAvatarRemove: () => void;
  onLogout: () => void;
  onOpenMobileSidebar?: () => void;
}

export function StatusBar({
  isConnected,
  currentTime,
  user,
  onUpdateProfile,
  onAvatarUpload,
  onAvatarRemove,
  onLogout,
  onOpenMobileSidebar,
}: StatusBarProps) {
  const [notifications, setNotifications] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<LogItemData[]>([]);
  const [unread, setUnread] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    
    // Load push notification settings
    const savedPushNotif = localStorage.getItem("rinchan_push_notifications");
    if (savedPushNotif !== null) setNotifications(savedPushNotif === "true");

    // Load logs from session storage
    const savedLogs = sessionStorage.getItem("rinchan_logs");
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {}
    }

    // Listen to log events
    const handleLog = (e: any) => {
      const data = e.detail;
      setLogs((prev) => {
        const newLogs = [data, ...prev].slice(0, 50); // keep last 50 logs
        sessionStorage.setItem("rinchan_logs", JSON.stringify(newLogs));
        return newLogs;
      });
      setUnread(true);

      // Show toast if push notifications are enabled
      const savedPushNotif = localStorage.getItem("rinchan_push_notifications");
      const isPushEnabled = savedPushNotif !== null ? savedPushNotif === "true" : true;
      if (isPushEnabled) {
        toast({
          title: data.title,
          description: data.description,
          variant: data.type === "warning" ? "destructive" : "default",
          className: data.type === "success" 
            ? "bg-emerald-500 text-white border-none" 
            : undefined,
        });
      }
    };

    window.addEventListener("rinchan_log", handleLog);
    return () => window.removeEventListener("rinchan_log", handleLog);
  }, [toast]);

  return (
    <>
      <header className="glass-panel h-14 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 rounded-lg hover:bg-secondary/50 -ml-2"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="w-5 h-5 text-foreground/80" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-sm">R</span>
            </div>
            <span className="font-medium text-foreground/90 hidden sm:inline">Rinchan</span>
          </div>
          <Separator orientation="vertical" className="h-5 bg-border/50 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">
              {mounted
                ? currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
                : "--:--"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isConnected
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
              }`}
          >
            {isConnected ? (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connected</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
              </>
            ) : (
              <>
                <Unplug className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Disconnected</span>
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-5 bg-border/50 hidden sm:block" />


          {/* Notifications */}
          <Popover onOpenChange={(open) => {
            if (open) setUnread(false);
          }}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-lg hover:bg-secondary/50"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] sm:w-80 glass-panel p-4"
              align="end"
              sideOffset={8}
              collisionPadding={16}
            >
              <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
                <h3 className="font-medium">Notifikasi Riwayat</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <NotificationItem
                      key={i}
                      title={log.title}
                      description={log.description}
                      time={formatTimeAgo(log.timestamp)}
                      type={log.type}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Belum ada notifikasi
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary/50"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            className="h-8 px-2 gap-2 rounded-lg hover:bg-secondary/50"
            onClick={() => setProfileOpen(true)}
          >
            <Avatar className="w-7 h-7 sm:w-6 sm:h-6">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">{user.name.split(" ")[0]}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:inline" />
          </Button>
        </div>
      </header>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />

      <ProfilePanel
        open={profileOpen}
        onOpenChange={setProfileOpen}
        user={user}
        onUpdateProfile={onUpdateProfile}
        onAvatarUpload={onAvatarUpload}
        onAvatarRemove={onAvatarRemove}
        onLogout={onLogout}
      />
    </>
  );
}

function NotificationItem({
  title,
  description,
  time,
  type,
}: {
  title: string;
  description: string;
  time: string;
  type: "warning" | "success";
}) {
  const colors = {
    warning: "bg-destructive/20 border-destructive/30",
    success: "bg-success/20 border-success/30",
  };

  return (
    <div
      className={`p-3 rounded-lg border ${colors[type]} transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {time}
        </span>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number) {
  const diffInMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffInMinutes < 1) return "Baru saja";
  if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}j lalu`;
  return `${Math.floor(diffInHours / 24)}h lalu`;
}
