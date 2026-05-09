"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wifi, Bell, Palette, Save } from "lucide-react";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [autoConnect, setAutoConnect] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-panel border-l-glass-border w-[85vw] sm:w-[540px] overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="space-y-1 p-0">
          <SheetTitle className="text-xl">Settings</SheetTitle>
          <SheetDescription>
            Configure your Rinchan dashboard preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-col gap-6">
          {/* Connection Settings */}
          <section className="flex flex-col gap-4 border-b border-border/30 pb-6">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/90">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wifi className="w-4 h-4 text-primary" />
              </div>
              <span>Connection</span>
            </div>
            <div className="pl-11">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-connect" className="text-sm font-medium">
                    Auto-connect on startup
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically connect to Rinchan device
                  </p>
                </div>
                <Switch
                  id="auto-connect"
                  checked={autoConnect}
                  onCheckedChange={setAutoConnect}
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="flex flex-col gap-4 border-b border-border/30 pb-6">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/90">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <span>Notifications</span>
            </div>
            <div className="pl-11">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Push notifications
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive alerts for sensor anomalies
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="flex flex-col gap-4 pb-2">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/90">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <span>Appearance</span>
            </div>
            <div className="pl-11">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-secondary/50 border-border/50 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-glass-border">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <Button className="w-full gap-2" onClick={() => onOpenChange(false)}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
