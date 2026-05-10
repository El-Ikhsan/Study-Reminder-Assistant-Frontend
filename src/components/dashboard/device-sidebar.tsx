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
import { api } from "@/lib/api";
import { useEffect, useCallback } from "react";

interface Device {
  id: string;
  name: string;
  type: "main" | "sensor" | "controller";
  status: "online" | "offline" | "standby";
  icon?: React.ReactNode;
}

interface DeviceSidebarProps {
  selectedDevice: string;
  onSelectDevice: (id: string) => void;
}

export function DeviceSidebar({
  selectedDevice,
  onSelectDevice,
}: DeviceSidebarProps) {
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Claim form state
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await api.get("/device/list");
      if (res.data.success) {
        const mapped: Device[] = res.data.data.map((d: any) => ({
          id: d.id,
          name: d.deviceName,
          type: "main",
          status: "online",
          icon: <Cpu className="w-4 h-4" />,
        }));
        setDevices(mapped);
      }
    } catch (err) {
      console.error("Gagal mengambil perangkat", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Handle initial selection once devices are loaded
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      onSelectDevice(devices[0].id);
    }
  }, [devices, selectedDevice, onSelectDevice]);

  const handleClaimDevice = async () => {
    if (!deviceName || !deviceId) {
      setError("Semua kolom harus diisi");
      return;
    }
    
    setIsClaiming(true);
    setError("");
    
    try {
      const res = await api.post("/device/claim", {
        deviceIotId: deviceId,
        deviceName: deviceName
      });
      
      if (res.data.success) {
        setAddDeviceOpen(false);
        setDeviceName("");
        setDeviceId("");
        fetchDevices();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengklaim perangkat");
    } finally {
      setIsClaiming(false);
    }
  };

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
        {isLoading ? (
          <div className="flex justify-center items-center h-20 text-muted-foreground text-sm">
            Memuat...
          </div>
        ) : devices.length === 0 ? (
          <div className="flex justify-center items-center h-20 text-muted-foreground text-sm">
            Belum ada perangkat
          </div>
        ) : (
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
        )}
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
              {error && <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-md border border-destructive/20">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  placeholder="e.g., Rinchan Room"
                  className="bg-secondary/50 border-border/50"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-id">Device IoT ID (10 chars)</Label>
                <Input
                  id="device-id"
                  placeholder="e.g., ABCDEFGHIJ"
                  className="bg-secondary/50 border-border/50"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setAddDeviceOpen(false)}
                  disabled={isClaiming}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleClaimDevice} disabled={isClaiming}>
                  {isClaiming ? "Adding..." : "Add Device"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
