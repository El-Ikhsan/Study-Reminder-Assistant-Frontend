"use client";

import { useState } from "react";
import {
  Cpu,
  Thermometer,
  Sun,
  Volume2,
  Timer,
  ChevronRight,
  Circle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Device {
  id: string;
  name: string;
  type: "main" | "sensor" | "controller";
  status: "online" | "offline" | "standby";
  icon: React.ReactNode;
}

const devices: Device[] = [
  {
    id: "rinchan-main",
    name: "Rinchan Core",
    type: "main",
    status: "online",
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    id: "temp-sensor",
    name: "Temperature",
    type: "sensor",
    status: "online",
    icon: <Thermometer className="w-4 h-4" />,
  },
  {
    id: "light-sensor",
    name: "Brightness",
    type: "sensor",
    status: "online",
    icon: <Sun className="w-4 h-4" />,
  },
  {
    id: "speaker",
    name: "Speaker",
    type: "controller",
    status: "online",
    icon: <Volume2 className="w-4 h-4" />,
  },
  {
    id: "pomodoro",
    name: "Focus Timer",
    type: "controller",
    status: "standby",
    icon: <Timer className="w-4 h-4" />,
  },
];

interface DeviceSidebarProps {
  selectedDevice: string;
  onSelectDevice: (id: string) => void;
}

export function DeviceSidebar({
  selectedDevice,
  onSelectDevice,
}: DeviceSidebarProps) {
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);

  const statusColors = {
    online: "bg-success",
    offline: "bg-destructive",
    standby: "bg-warning",
  };

  return (
    <aside className="flex flex-col h-full w-full">
      <div className="p-4 border-b border-border/30">
        <h2 className="font-semibold text-sm text-foreground/80">Devices</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {devices.filter((d) => d.status === "online").length} of{" "}
          {devices.length} online
        </p>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-1">
          {devices.map((device) => (
            <Button
              key={device.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-12 px-3 gap-3 rounded-xl transition-all",
                selectedDevice === device.id
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "hover:bg-secondary/50 text-foreground/80"
              )}
              onClick={() => onSelectDevice(device.id)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  selectedDevice === device.id
                    ? "bg-primary/20"
                    : "bg-secondary/60"
                )}
              >
                {device.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{device.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Circle
                    className={cn(
                      "w-1.5 h-1.5 fill-current",
                      statusColors[device.status]
                    )}
                    style={{
                      color: `var(--${device.status === "online" ? "success" : device.status === "offline" ? "destructive" : "warning"})`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {device.status}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-all",
                  selectedDevice === device.id
                    ? "text-primary opacity-100"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100"
                )}
              />
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/30">
        <Dialog open={addDeviceOpen} onOpenChange={setAddDeviceOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-10 gap-2 rounded-xl border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Device</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-glass-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Connect a new IoT device to your Rinchan network.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  placeholder="Enter device name"
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-id">Device ID</Label>
                <Input
                  id="device-id"
                  placeholder="e.g., sensor-001"
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setAddDeviceOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => setAddDeviceOpen(false)}>
                  Add Device
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
