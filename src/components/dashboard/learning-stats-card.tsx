"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Calendar as CalendarIcon,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// ─── Types ─────────────────────────────────────────────────────────────────
type StatsRange = "week" | "month";

interface LearningStats {
  range: StatsRange;
  totalFocusMinutes: number;
  previousFocusMinutes: number;
  sessionCount: number;
  previousSessionCount: number;
  completedCount: number;
  focusTrendPct: number;
  sessionTrendPct: number;
  dominantDistraction: "Suhu Panas" | "Suhu Dingin" | "Suara Bising" | "Cahaya Gelap" | "Cahaya Silau" | "Optimal" | null;
  totalSensorEvents: number;
  interupsiCount: number;
  pemulihanCount: number;
  distractionChartData: { label: string; value: number }[];
  chartData: { label: string; value: number }[];
  periodLabel?: string;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function TrendBadge({
  current,
  previous,
  pct,
}: {
  current: number;
  previous: number;
  pct: number;
}) {
  const isUp = pct > 0;
  const isDown = pct < 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium",
        isUp
          ? "bg-success/10 text-success"
          : isDown
            ? "bg-warning/10 text-warning"
            : "bg-secondary text-muted-foreground"
      )}
    >
      {isUp && <TrendingUp className="w-3 h-3" />}
      {isDown && <TrendingDown className="w-3 h-3" />}
      {!isUp && !isDown && <Minus className="w-3 h-3" />}
      <span>
        {isUp ? "+" : ""}
        {pct}%
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function LearningStatsCard() {
  const [range, setRange] = useState<StatsRange>("week");
  const [offset, setOffset] = useState<number>(0);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async (r: StatsRange, o: number) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/pomodoro/stats?range=${r}&offset=${o}`);
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil statistik", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(range, offset);
  }, [range, offset, fetchStats]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (range === "month") {
      const now = new Date();
      const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      setOffset(Math.max(0, diffMonths));
    } else {
      const now = new Date();
      
      const getMonday = (d: Date) => {
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(d);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(d.getDate() + diff);
        return monday;
      };
      
      const diffMs = getMonday(now).getTime() - getMonday(date).getTime();
      const diffWeeks = Math.max(0, Math.round(diffMs / (7 * 24 * 3600 * 1000)));
      setOffset(diffWeeks);
    }
  };

  const rangeTabs: { key: StatsRange; label: string }[] = [
    { key: "week", label: "7 Hari" },
    { key: "month", label: "30 Hari" },
  ];

  // Saran berdasarkan distraksi dominan
  const dist = stats?.dominantDistraction;
  let advice = "";
  if (dist === "Suhu Panas") advice = "Atur ventilasi atau nyalakan pendingin ruangan agar suhu lebih nyaman.";
  else if (dist === "Suhu Dingin") advice = "Suhu terlalu dingin. Naikkan suhu ruangan atau kenakan pakaian tebal.";
  else if (dist === "Cahaya Gelap") advice = "Pindah ke tempat yang lebih terang atau nyalakan lampu belajar.";
  else if (dist === "Cahaya Silau") advice = "Terlalu silau. Pindah posisi atau kurangi intensitas lampu di sekitar.";
  else if (dist === "Suara Bising") advice = "Belajar di tempat yang lebih tenang atau gunakan penyumbat telinga.";

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">

          <div>
            <h3 className="text-lg font-semibold">Evaluation Statistics</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kinerja produktivitas & gangguan lingkungan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
            {rangeTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setRange(t.key);
                  setOffset(0); // Reset offset ketika ganti tab
                }}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-medium transition-all",
                  range === t.key
                    ? "bg-background/80 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchStats(range, offset)}
            disabled={isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")}
            />
          </button>
        </div>
      </div>

      {/* ── Navigasi Periode ──────────────────────────────────────────────── */}
      {stats && (
        <div className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <button
                disabled={isLoading}
                className="group flex items-center gap-2 bg-secondary/30 hover:bg-secondary/50 px-4 py-2 rounded-xl border border-border/50 transition-colors disabled:opacity-50"
              >
                <CalendarIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium text-foreground">
                  {stats.periodLabel || "Memuat..."}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={new Date()}
                onSelect={handleDateSelect}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {isLoading && !stats && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Memuat data metrik...
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {stats && (
        <div className="space-y-6">

          {/* ── 1. Fokus + Grafik ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Stat Waktu Fokus */}
            <div className="glass-panel p-5 group hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-chart-2/15"
                    style={{ backgroundColor: "color-mix(in srgb, var(--chart-2) 15%, transparent)" }}>
                    <Clock className="w-5 h-5" style={{ color: "var(--chart-2)" }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground/80">Waktu Fokus</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Total sesi selesai</p>
                  </div>
                </div>
                <TrendBadge
                  current={stats.totalFocusMinutes}
                  previous={stats.previousFocusMinutes}
                  pct={stats.focusTrendPct}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight">
                    {stats.totalFocusMinutes}
                  </span>
                  <span className="text-sm text-muted-foreground">mnt</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                  <span>Periode lalu</span>
                  <span className="font-medium text-foreground">
                    {stats.previousFocusMinutes} mnt
                  </span>
                </div>
              </div>
            </div>

            {/* Grafik Bar Tren */}
            <div className="glass-panel p-5 md:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground/80">Tren Waktu Fokus</h3>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  <span className="text-[10px] text-muted-foreground">
                    {stats.completedCount} sesi selesai
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.chartData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      dy={8}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-panel-subtle px-3 py-2">
                              <p className="text-xs text-muted-foreground mb-1">{label}</p>
                              <p className="text-sm font-medium" style={{ color: "var(--chart-2)" }}>
                                {payload[0].value} mnt
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ fill: "color-mix(in srgb, var(--chart-2) 10%, transparent)" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── 2. Environment Stats ──────────────────────────────────────── */}
          <div className="space-y-4  border-t border-border/50">


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Distraksi Dominan */}
              <div className="glass-panel p-5 flex flex-col justify-between group hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/15">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground/80">Gangguan Terbesar</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {stats.interupsiCount} interupsi tercatat
                      </p>
                    </div>
                  </div>
                </div>

                {stats.totalSensorEvents === 0 ? (
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-success">Optimal</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Lingkungan selalu dalam kondisi kondusif.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-semibold tracking-tight">
                      {stats.dominantDistraction ?? "—"}
                    </p>
                    {advice && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {advice}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Grafik Frekuensi Gangguan */}
              <div className="glass-panel p-5 flex flex-col justify-center">
                <h3 className="text-sm font-medium text-foreground/80 mb-4">Frekuensi Gangguan</h3>
                <div className="flex-1 w-full min-h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.distractionChartData}
                      margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        dy={8}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-panel-subtle px-3 py-2">
                                <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.label}</p>
                                <p className="text-sm font-medium text-warning">
                                  {payload[0].value} kali
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: "color-mix(in srgb, var(--warning) 10%, transparent)" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="var(--warning)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}