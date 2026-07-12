
import { useState, useEffect, useRef } from "react";
import { StatusBar } from "@/components/dashboard/status-bar";
import { DeviceSidebar, type Device } from "@/components/dashboard/device-sidebar";
import { TelemetryCards } from "@/components/dashboard/telemetry-cards";
import { TelemetryChart } from "@/components/dashboard/telemetry-chart";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { PomodoroLogCard } from "@/components/dashboard/pomodoro-log-card";
import { LearningStatsCard } from "@/components/dashboard/learning-stats-card";
import { useTelemetry } from "@/hooks/use-telemetry";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { addRinchanLog } from "@/lib/logger";

import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, updateUser, logout } = useAuth();
  
  const [selectedDevice, setSelectedDevice] = useState("");
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [activeMetric, setActiveMetric] = useState<"temperature" | "brightness" | "noise">("temperature");
  const [screenBrightness, setScreenBrightness] = useState(70);
  const [speakerVolume, setSpeakerVolume] = useState(45);
  const [sensorConfig, setSensorConfig] = useState({ temperature: true, light: true, noise: true, force_cold: false });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { currentData, chartData, isConnected, isDataActive } = useTelemetry(selectedDevice);
  const {
    isRunning,
    timeLeft,
    sessionType,
    currentCycle,
    sessionsCompleted,
    settings,
    isComplete,
    sessionId,
    toggle,
    reset,
    updateSettings,
  } = usePomodoro(selectedDevice);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6 relative text-foreground">
      {/* Dynamic Background with Unsplash */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">
        {/* Base Unsplash Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1728721529009-bfaab6fcc8e6?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />

        {/* Subtle Ambient Glows (Optional, adds to the IoT feel) */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[120px] animate-pulse-soft mix-blend-overlay" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 dark:bg-accent/15 rounded-full blur-[100px] animate-pulse-soft mix-blend-overlay" style={{ animationDelay: "2s" }} />
      </div>

      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* Status Bar */}
        <StatusBar
          isConnected={isConnected}
          currentTime={currentTime}
          user={user!}
          onUpdateProfile={async (profile) => {
            try {
              const res = await api.patch("/user/me", profile);
              if (res.data.success) {
                updateUser(res.data.data.user);
                addRinchanLog("Profil Diperbarui", "Data profil Anda berhasil diperbarui.", "success");
              }
            } catch (err: any) {
              console.error("Gagal update profil", err);
              addRinchanLog("Gagal Memperbarui Profil", err.response?.data?.message || "Terjadi kesalahan saat memperbarui profil.", "warning");
            }
          }}
          onAvatarUpload={async (file) => {
            try {
              const formData = new FormData();
              formData.append("avatar", file);
              const res = await api.post("/user/me/avatar", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              if (res.data.success) {
                updateUser({ avatarUrl: res.data.data.avatarUrl });
                addRinchanLog("Avatar Diperbarui", "Foto profil Anda berhasil diunggah.", "success");
              }
            } catch (err: any) {
              console.error("Gagal upload avatar", err);
              addRinchanLog("Gagal Mengunggah Avatar", err.response?.data?.message || "Terjadi kesalahan saat mengunggah foto profil.", "warning");
            }
          }}
          onAvatarRemove={async () => {
            try {
              const res = await api.delete("/user/me/avatar");
              if (res.data.success) {
                updateUser({ avatarUrl: null });
                addRinchanLog("Avatar Dihapus", "Foto profil Anda berhasil dihapus.", "success");
              }
            } catch (err: any) {
              console.error("Gagal hapus avatar", err);
              addRinchanLog("Gagal Menghapus Avatar", err.response?.data?.message || "Terjadi kesalahan saat menghapus foto profil.", "warning");
            }
          }}
          onLogout={logout}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Mobile Device Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="glass-panel border-r-glass-border p-0 w-[85vw] sm:w-[320px]">
            <DeviceSidebar
              selectedDevice={selectedDevice}
              onSelectDevice={(id, device) => {
                setSelectedDevice(id);
                if (device) {
                  setCurrentDevice(device);
                  if (device.brightness !== undefined) setScreenBrightness(device.brightness);
                  if (device.volume !== undefined) setSpeakerVolume(device.volume);
                }
                setIsMobileSidebarOpen(false);
              }}
              isDataActive={isDataActive}
              screenBrightness={screenBrightness}
              onScreenBrightnessChange={setScreenBrightness}
              onScreenBrightnessCommit={async (val) => {
                if (!selectedDevice) return;
                try {
                  const res = await api.post("/device/settings/brightness", { deviceId: selectedDevice, value: val });
                  if (res.data.success) {
                    addRinchanLog("Pengaturan Kecerahan", res.data.message || `Kecerahan diubah menjadi ${val}%`, "success");
                  }
                } catch (err: any) {
                  addRinchanLog("Gagal Mengubah Kecerahan", err.response?.data?.message || "Terjadi kesalahan", "warning");
                }
              }}
              speakerVolume={speakerVolume}
              onSpeakerVolumeChange={setSpeakerVolume}
              onSpeakerVolumeCommit={async (val) => {
                if (!selectedDevice) return;
                try {
                  const res = await api.post("/device/settings/volume", { deviceId: selectedDevice, value: val });
                  if (res.data.success) {
                    addRinchanLog("Pengaturan Volume", res.data.message || `Volume diubah menjadi ${val}%`, "success");
                  }
                } catch (err: any) {
                  addRinchanLog("Gagal Mengubah Volume", err.response?.data?.message || "Terjadi kesalahan", "warning");
                }
              }}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex gap-4 h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <div className="hidden lg:block glass-panel w-64 overflow-hidden">
            <DeviceSidebar
              selectedDevice={selectedDevice}
              onSelectDevice={(id, device) => {
                setSelectedDevice(id);
                if (device) {
                  setCurrentDevice(device);
                  if (device.brightness !== undefined) setScreenBrightness(device.brightness);
                  if (device.volume !== undefined) setSpeakerVolume(device.volume);
                }
              }}
              isDataActive={isDataActive}
              screenBrightness={screenBrightness}
              onScreenBrightnessChange={setScreenBrightness}
              onScreenBrightnessCommit={async (val) => {
                if (!selectedDevice) return;
                try {
                  const res = await api.post("/device/settings/brightness", { deviceId: selectedDevice, value: val });
                  if (res.data.success) {
                    addRinchanLog("Pengaturan Kecerahan", res.data.message || `Kecerahan diubah menjadi ${val}%`, "success");
                  }
                } catch (err: any) {
                  addRinchanLog("Gagal Mengubah Kecerahan", err.response?.data?.message || "Terjadi kesalahan", "warning");
                }
              }}
              speakerVolume={speakerVolume}
              onSpeakerVolumeChange={setSpeakerVolume}
              onSpeakerVolumeCommit={async (val) => {
                if (!selectedDevice) return;
                try {
                  const res = await api.post("/device/settings/volume", { deviceId: selectedDevice, value: val });
                  if (res.data.success) {
                    addRinchanLog("Pengaturan Volume", res.data.message || `Volume diubah menjadi ${val}%`, "success");
                  }
                } catch (err: any) {
                  addRinchanLog("Gagal Mengubah Volume", err.response?.data?.message || "Terjadi kesalahan", "warning");
                }
              }}
            />
          </div>

          {/* Dashboard Content */}
          <main className="flex-1 space-y-4 overflow-y-auto">
            {/* Telemetry Cards */}
            <section>
              <TelemetryCards data={currentData} />
            </section>

            {/* Top Row: Chart & Timer */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Live Chart */}
              <div className="xl:col-span-2">
                <TelemetryChart
                  data={chartData}
                  activeMetric={activeMetric}
                  onMetricChange={setActiveMetric}
                />
              </div>

              {/* Pomodoro Timer */}
              <div>
                <PomodoroTimer
                  isRunning={isRunning}
                  onToggle={toggle}
                  timeLeft={timeLeft}
                  onReset={reset}
                  sessionType={sessionType}
                  currentCycle={currentCycle}
                  sessionsCompleted={sessionsCompleted}
                  settings={settings}
                  onUpdateSettings={updateSettings}
                  isComplete={isComplete}
                  sensorConfig={sensorConfig}
                  isDeviceOnline={isDataActive}
                  onSensorToggle={async (sensor, enabled) => {
                    if (!selectedDevice) return;
                    try {
                      setSensorConfig((prev: any) => ({ ...prev, [sensor]: enabled }));
                      const res = await api.post("/device/settings/sensor", { deviceId: selectedDevice, sensorType: sensor, enabled });
                      if (res.data.success) {
                        addRinchanLog("Pengaturan Sensor", res.data.message || `Sensor ${sensor} ${enabled ? 'menyala' : 'mati'}`, "success");
                      }
                    } catch (err: any) {
                      setSensorConfig((prev: any) => ({ ...prev, [sensor]: !enabled }));
                      addRinchanLog("Gagal Mengubah Sensor", err.response?.data?.message || "Terjadi kesalahan", "warning");
                    }
                  }}
                />
              </div>
            </div>

            {/* Middle Row: Pomodoro Log full-width */}
            <div>
              <PomodoroLogCard currentSessionId={sessionId} />
            </div>

            {/* Bottom Row: Statistics Panel (Evaluasi diletakkan di akhir sebagai laporan) */}
            <div>
              <LearningStatsCard />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
