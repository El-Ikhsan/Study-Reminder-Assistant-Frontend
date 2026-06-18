"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  Sun,
  Volume2,
  Circle,
  Plus,
  Settings,
  RefreshCw,
  Save,
  Trash2,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { addRinchanLog } from "@/lib/logger";

export interface Device {
  id: string;
  name: string;
  type: "main" | "sensor" | "controller";
  status: "online" | "offline" | "standby";
  icon?: React.ReactNode;
  deviceIotId?: string;
  tokenVersion?: number;
  brightness?: number;
  volume?: number;
}

interface DeviceSidebarProps {
  selectedDevice: string;
  onSelectDevice: (id: string, device?: Device) => void;
  isDataActive?: boolean;
  screenBrightness: number;
  onScreenBrightnessChange: (value: number) => void;
  onScreenBrightnessCommit: (value: number) => void;
  speakerVolume: number;
  onSpeakerVolumeChange: (value: number) => void;
  onSpeakerVolumeCommit: (value: number) => void;
}

export function DeviceSidebar({
  selectedDevice,
  onSelectDevice,
  isDataActive = false,
  screenBrightness,
  onScreenBrightnessChange,
  onScreenBrightnessCommit,
  speakerVolume,
  onSpeakerVolumeChange,
  onSpeakerVolumeCommit,
}: DeviceSidebarProps) {
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Claim form state
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  // Device Detail / Edit state
  const [detailOpen, setDetailOpen] = useState(false);
  const [deviceToDetail, setDeviceToDetail] = useState<Device | null>(null);
  const [editDeviceName, setEditDeviceName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Confirmations state
  const [renewConfirmOpen, setRenewConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
          deviceIotId: d.deviceIotId,
          tokenVersion: d.tokenVersion,
          brightness: d.brightness,
          volume: d.volume,
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
      onSelectDevice(devices[0].id, devices[0]);
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
        deviceName: deviceName,
      });
      if (res.data.success) {
        setAddDeviceOpen(false);
        setDeviceName("");
        setDeviceId("");
        fetchDevices();
        addRinchanLog("Berhasil Menambah Perangkat", `Perangkat ${deviceName} berhasil ditambahkan ke akun Anda.`, "success");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengklaim perangkat");
      addRinchanLog("Gagal Menambah Perangkat", err.response?.data?.message || "Gagal mengklaim perangkat", "warning");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleOpenDetail = (device: Device, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeviceToDetail(device);
    setEditDeviceName(device.name);
    setDetailOpen(true);
  };

  const handleUpdateDeviceName = async () => {
    if (!deviceToDetail || !editDeviceName) return;
    setIsUpdating(true);
    try {
      const res = await api.patch(`/device/${deviceToDetail.id}`, {
        deviceName: editDeviceName,
      });
      if (res.data.success) {
        setDetailOpen(false);
        fetchDevices();
        addRinchanLog("Berhasil Memperbarui Perangkat", `Nama perangkat berhasil diubah menjadi ${editDeviceName}.`, "success");
      }
    } catch (err: any) {
      console.error("Gagal update device", err);
      addRinchanLog("Gagal Memperbarui Perangkat", err.response?.data?.message || "Terjadi kesalahan saat memperbarui perangkat", "warning");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRenewToken = async () => {
    if (!deviceToDetail) return;
    setIsUpdating(true);
    try {
      const res = await api.post(`/device/${deviceToDetail.id}/renew`);
      if (res.data.success) {
        fetchDevices();
        setDeviceToDetail(prev => prev ? { ...prev, tokenVersion: res.data.data.version } : null);
        setRenewConfirmOpen(false);
        addRinchanLog("Token Perangkat Diperbarui", `Token untuk perangkat ${deviceToDetail.name} berhasil di-renew ke v${res.data.data.version}.`, "success");
      }
    } catch (err: any) {
      console.error("Gagal renew token", err);
      addRinchanLog("Gagal Memperbarui Token", err.response?.data?.message || "Terjadi kesalahan saat memperbarui token", "warning");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDetail) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/device/${deviceToDetail.id}`);
      if (res.data.success) {
        setDeleteConfirmOpen(false);
        setDetailOpen(false);
        if (selectedDevice === deviceToDetail.id) {
          onSelectDevice("");
        }
        fetchDevices();
        addRinchanLog("Perangkat Dihapus", `Perangkat ${deviceToDetail.name} dan seluruh riwayatnya telah dihapus permanen.`, "warning");
      }
    } catch (err: any) {
      console.error("Gagal menghapus perangkat", err);
      addRinchanLog("Gagal Menghapus Perangkat", err.response?.data?.message || "Terjadi kesalahan saat menghapus perangkat", "warning");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColors = {
    online: "bg-success",
    offline: "bg-destructive",
    standby: "bg-warning",
  };

  return (
    <aside className="flex flex-col h-full w-full overflow-hidden bg-background/50">
      <div className="p-4 border-b border-border/30 shrink-0">
        <h2 className="font-semibold text-sm text-foreground/80">Devices</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {devices.filter((d) => (d.id === selectedDevice && isDataActive)).length} of{" "}
          {devices.length} online
        </p>
      </div>

      <ScrollArea className="shrink min-h-0 px-2 py-3">
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
                onClick={() => onSelectDevice(device.id, device)}
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
                        statusColors[(device.id === selectedDevice && isDataActive) ? "online" : "offline"]
                      )}
                      style={{
                        color: `var(--${(device.id === selectedDevice && isDataActive) ? "success" : "destructive"})`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {(device.id === selectedDevice && isDataActive) ? "online" : "offline"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      selectedDevice === device.id
                        ? "text-primary opacity-100"
                        : "text-muted-foreground opacity-0 group-hover:opacity-100"
                    )}
                    onClick={(e) => handleOpenDetail(device, e)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Device Controls (Settings section) */}
      {selectedDevice && devices.length > 0 && (() => {
        const isDeviceOnline = isDataActive;
        return (
          <div className="border-t border-border/30">
            <div className="px-4 py-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-foreground/80">Settings</h2>
                {!isDeviceOnline && (
                  <span className="text-[10px] text-destructive/70 font-medium">offline</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Device hardware controls</p>
            </div>
            <div className={cn("py-5 px-3 transition-opacity", !isDeviceOnline && "opacity-50")}>
              <div className="flex justify-evenly items-end">
                {/* Brightness */}
                <div className="flex flex-col items-center gap-3 w-16">
                  <div className="h-28" style={{ overflow: "visible" }}>
                    <Slider
                      orientation="vertical"
                      value={[screenBrightness]}
                      onValueChange={([v]) => onScreenBrightnessChange(v)}
                      onValueCommit={([v]) => onScreenBrightnessCommit(v)}
                      max={100}
                      step={1}
                      disabled={!isDeviceOnline}
                      className="!min-h-0 !h-28 [&_[data-slot=slider-track]]:!w-2"
                    />
                  </div>
                  <Sun className="w-3.5 h-3.5 text-primary/50" />
                  <span className="text-[10px] font-mono font-medium text-muted-foreground tabular-nums">{screenBrightness}%</span>
                </div>

                {/* Divider */}
                <div className="w-px h-20 bg-border/40 mb-8" />

                {/* Volume */}
                <div className="flex flex-col items-center gap-3 w-16">
                  <div className="h-28" style={{ overflow: "visible" }}>
                    <Slider
                      orientation="vertical"
                      value={[speakerVolume]}
                      onValueChange={([v]) => onSpeakerVolumeChange(v)}
                      onValueCommit={([v]) => onSpeakerVolumeCommit(v)}
                      max={100}
                      step={1}
                      disabled={!isDeviceOnline}
                      className="!min-h-0 !h-28 [&_[data-slot=slider-track]]:!w-2"
                    />
                  </div>
                  <Volume2 className="w-3.5 h-3.5 text-primary/50" />
                  <span className="text-[10px] font-mono font-medium text-muted-foreground tabular-nums">{speakerVolume}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer: Add Device */}
      {devices.length === 0 && (
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
                  Hubungkan perangkat IoT baru ke jaringan Rinchan Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {error && (
                  <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}
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
                  <Button variant="secondary" className="flex-1" onClick={() => setAddDeviceOpen(false)} disabled={isClaiming}>
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
      )}

      {/* Device Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-panel border-glass-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Device Details</DialogTitle>
            <DialogDescription>
              View and manage settings for your IoT device.
            </DialogDescription>
          </DialogHeader>
          {deviceToDetail && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-device-name">Device Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-device-name"
                    className="bg-secondary/50 border-border/50"
                    value={editDeviceName}
                    onChange={(e) => setEditDeviceName(e.target.value)}
                  />
                  <Button
                    onClick={handleUpdateDeviceName}
                    disabled={isUpdating || editDeviceName === deviceToDetail.name || !editDeviceName}
                    className="shrink-0"
                  >
                    {isUpdating ? "..." : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Device IoT ID</Label>
                <div className="px-3 py-2 bg-secondary/30 rounded-md border border-border/50 font-mono text-sm">
                  {deviceToDetail.deviceIotId || "Unknown"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Version Token</Label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-secondary/30 rounded-md border border-border/50 font-mono text-sm flex items-center">
                    <span>v{deviceToDetail.tokenVersion || 1}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setRenewConfirmOpen(true)}
                    disabled={isUpdating}
                    className="shrink-0 gap-2 border-primary/20 hover:bg-primary/10 text-primary"
                    title="Perbarui versi token perangkat"
                  >
                    <RefreshCw className={cn("w-4 h-4", isUpdating && "animate-spin")} />
                    Renew
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Memperbarui versi token akan mengharuskan perangkat fisik untuk mengambil token yang baru.
                </p>
              </div>

              <div className="pt-4 border-t border-border/30 mt-4">
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Perangkat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Token Confirmation */}
      <Dialog open={renewConfirmOpen} onOpenChange={setRenewConfirmOpen}>
        <DialogContent className="glass-panel border-glass-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Token Perangkat</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memperbarui token untuk perangkat ini?
              Perangkat fisik akan terputus sementara dan perlu menyambung kembali dengan token yang baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRenewConfirmOpen(false)} disabled={isUpdating}>
              Batal
            </Button>
            <Button onClick={handleRenewToken} disabled={isUpdating}>
              {isUpdating ? "Memproses..." : "Ya, Perbarui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="glass-panel border-glass-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Hapus Perangkat</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Menghapus perangkat akan{" "}
              <b>menghapus seluruh data historis (sesi pomodoro, dll)</b> yang terkait dengan perangkat ini selamanya.
              Apakah Anda yakin?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteDevice} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
