"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
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
import { Switch } from "@/components/ui/switch";
import { SettingsSheet } from "./settings-sheet";
import { ProfilePanel } from "./profile-panel";

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connected</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Disconnected</span>
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-5 bg-border/50 hidden sm:block" />


          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-lg hover:bg-secondary/50"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {notifications && (
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Notifications</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Alerts</span>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <NotificationItem
                  title="Temperature Alert"
                  description="Room temperature is above optimal range"
                  time="2m ago"
                  type="warning"
                />
                <NotificationItem
                  title="Focus Session Complete"
                  description="Great work! You completed a 25-minute session"
                  time="15m ago"
                  type="success"
                />
                <NotificationItem
                  title="Device Connected"
                  description="Rinchan is now online and synced"
                  time="1h ago"
                  type="info"
                />
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
  type: "warning" | "success" | "info";
}) {
  const colors = {
    warning: "bg-warning/20 border-warning/30",
    success: "bg-success/20 border-success/30",
    info: "bg-primary/20 border-primary/30",
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
