
import { useState, useEffect } from "react";
import { StatusBar } from "@/components/dashboard/status-bar";
import { DeviceSidebar } from "@/components/dashboard/device-sidebar";
import { TelemetryCards } from "@/components/dashboard/telemetry-cards";
import { TelemetryChart } from "@/components/dashboard/telemetry-chart";
import { ControlsPanel } from "@/components/dashboard/controls-panel";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { PomodoroLogCard } from "@/components/dashboard/pomodoro-log-card";
import { useTelemetry } from "@/hooks/use-telemetry";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Mock user data - replace with actual auth state
const MOCK_USER = {
  id: "user-1",
  name: "Rin Kagamine",
  email: "rin@rinchan.io",
  username: "rinchan",
  location: "Tokyo, Japan",
  organization: "Rinchan Labs",
  avatarUrl: null as string | null,
};

export default function DashboardPage() {
  const [selectedDevice, setSelectedDevice] = useState("rinchan-main");
  const [activeMetric, setActiveMetric] = useState<"temperature" | "brightness" | "noise">("temperature");
  const [screenBrightness, setScreenBrightness] = useState(70);
  const [speakerVolume, setSpeakerVolume] = useState(45);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { currentData, chartData, isConnected } = useTelemetry();
  const {
    isRunning,
    timeLeft,
    sessionType,
    currentCycle,
    sessionsCompleted,
    settings,
    isComplete,
    toggle,
    reset,
    updateSettings,
  } = usePomodoro();

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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
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
          user={MOCK_USER}
          onUpdateProfile={() => {
            // TODO: Integrate with your API
          }}
          onAvatarUpload={() => {
            // TODO: Integrate with your API
          }}
          onAvatarRemove={() => {
            // TODO: Integrate with your API
          }}
          onLogout={() => {
            // TODO: Integrate with your auth
          }}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Mobile Device Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="glass-panel border-r-glass-border p-0 w-[85vw] sm:w-[320px]">
            <DeviceSidebar
              selectedDevice={selectedDevice}
              onSelectDevice={(device) => {
                setSelectedDevice(device);
                setIsMobileSidebarOpen(false);
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
              onSelectDevice={setSelectedDevice}
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
                />
              </div>
            </div>

            {/* Bottom Row: Logs & Controls */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Pomodoro Log Card */}
              <div className="xl:col-span-2 h-full">
                <PomodoroLogCard />
              </div>

              {/* Controls Panel */}
              <div className="h-full">
                <ControlsPanel
                  screenBrightness={screenBrightness}
                  onScreenBrightnessChange={setScreenBrightness}
                  speakerVolume={speakerVolume}
                  onSpeakerVolumeChange={setSpeakerVolume}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
