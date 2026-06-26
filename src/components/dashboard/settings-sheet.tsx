"use client";

import { useState, useEffect } from "react";
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
import { Bell, Palette, Save } from "lucide-react";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("rinchan_push_notifications");
      setNotifications(saved !== null ? saved === "true" : true);
      setLocalTheme(theme);
    }
  }, [open, theme]);

  const handleSave = () => {
    localStorage.setItem("rinchan_push_notifications", String(notifications));
    setTheme(localTheme);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-panel border-l-glass-border w-[85vw] sm:w-[540px] overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="space-y-1 p-0">
          <SheetTitle className="text-xl">Dashboard Settings</SheetTitle>
          <SheetDescription>
            Atur preferensi dashboard Anda
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-col gap-6">
          {/* Notifications */}
          <section className="flex flex-col gap-4 border-b border-border/30 pb-6">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/90">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <span>Notifikasi</span>
            </div>
            <div className="pl-11">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Push Notifikasi
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Terima peringatan push notifikasi secara umum
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
              <span>Tampilan</span>
            </div>
            <div className="pl-11">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tema</Label>
                <Select value={localTheme} onValueChange={(value) => setLocalTheme(value as any)}>
                  <SelectTrigger className="bg-secondary/50 border-border/50 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-glass-border">
                    <SelectItem value="dark">Gelap</SelectItem>
                    <SelectItem value="light">Terang</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <Button className="w-full gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
