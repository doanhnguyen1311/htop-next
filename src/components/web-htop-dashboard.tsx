"use client";

import * as React from "react";
import {
  Activity,
  Circle,
  HardDrive,
  Network,
  Server,
  Timer,
} from "lucide-react";
import { CpuBar } from "@/components/cpu-bar";
import { MemoryBar } from "@/components/memory-bar";
import { MetricCard } from "@/components/metric-card";
import { ProcessTable } from "@/components/process-table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createMetricsSocket, type KillAck } from "@/lib/ws";
import { cn } from "@/lib/utils";
import type { MetricsConnectionState, SystemMetrics } from "@/types/metrics";

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatRate(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MiB/s`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB/s`;
  return `${bytes.toFixed(0)} B/s`;
}

function Sparkline({ values }: { values: number[] }) {
  const points = values.length
    ? values
        .map((value, index) => {
          const x = (index / Math.max(1, values.length - 1)) * 100;
          const y = 100 - Math.min(100, Math.max(0, value));
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-12 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        className="text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.55)]"
      />
    </svg>
  );
}

export function WebHtopDashboard() {
  const [metrics, setMetrics] = React.useState<SystemMetrics | null>(null);
  const [connection, setConnection] =
    React.useState<MetricsConnectionState>("connecting");
  const [error, setError] = React.useState<string | null>(null);
  const [killAck, setKillAck] = React.useState<KillAck | null>(null);
  const [cpuHistory, setCpuHistory] = React.useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = React.useState<number[]>([]);
  const socketRef = React.useRef<ReturnType<typeof createMetricsSocket> | null>(
    null,
  );

  const [timeStream, setTimeStream] = React.useState<number | null>(null);

  React.useEffect(() => {
    socketRef.current = createMetricsSocket({
      onMetrics: (nextMetrics) => {
        setMetrics(nextMetrics);
        setConnection("online");
        setError(null);
        setCpuHistory((history) => [
          ...history.slice(-29),
          nextMetrics.cpu.usage,
        ]);
        setMemoryHistory((history) => [
          ...history.slice(-29),
          nextMetrics.memory.usage,
        ]);
      },
      onStatus: (online) => setConnection(online ? "online" : "offline"),
      onError: setError,
      onInterval: (intervalMs) => {
        setTimeStream(intervalMs / 1000);
      },
      onKillAck: (ack) => {
        setKillAck(ack);

        window.setTimeout(() => {
          setKillAck((currentAck) =>
            currentAck?.pid === ack.pid ? null : currentAck,
          );
        }, 5000);
      },
    });

    return () => socketRef.current?.close();
  }, []);

  const handleKillProcess = React.useCallback((pid: number) => {
    socketRef.current?.killProcess(pid);
  }, []);

  const online = connection === "online";

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-4 font-mono sm:p-6">
        <header className="flex flex-col gap-4 border-b border-emerald-400/20 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-emerald-300 sm:text-3xl">
                Running Progress
              </h1>
              <Badge
                variant={online ? "success" : "danger"}
                className="font-mono tracking-wide uppercase"
              >
                <Circle
                  className={cn(
                    "mr-1 size-2 fill-current",
                    online ? "text-emerald-300" : "text-rose-300",
                  )}
                />
                {connection}
              </Badge>
              <Badge variant="accent" className="font-mono">
                {timeStream ?? "--"}s stream
              </Badge>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              htop-inspired realtime system monitor powered by Node.js and
              WebSocket.
            </p>
          </div>
          <div className="grid gap-2 text-xs text-zinc-500 sm:grid-cols-3 lg:text-right">
            <span>host: {metrics?.host ?? "waiting"}</span>
            <span>uptime: {metrics ? formatUptime(metrics.uptime) : "--"}</span>
            <span>
              last:{" "}
              {metrics
                ? new Date(metrics.timestamp).toLocaleTimeString()
                : "--"}
            </span>
          </div>
        </header>

        {error ? (
          <div className="rounded-md border border-rose-400/30 bg-rose-950/40 p-3 text-sm text-rose-200">
            {error} Start the metrics server with{" "}
            <span className="text-rose-100">npm run monitor</span>.
          </div>
        ) : null}

        {killAck ? (
          <div
            className={cn(
              "rounded-md border p-3 text-sm",
              killAck.killed
                ? "border-emerald-400/30 bg-emerald-950/40 text-emerald-200"
                : "border-amber-400/30 bg-amber-950/40 text-amber-200",
            )}
          >
            PID {killAck.pid}: {killAck.message}
            {killAck.mocked ? " Real kill mode is disabled." : null}
          </div>
        ) : null}

        {!metrics ? (
          <section className="flex min-h-[65vh] items-center justify-center rounded-md border border-emerald-400/20 bg-zinc-950/80">
            <div className="flex items-center gap-3 text-zinc-400">
              <LoadingSpinner className="size-5 text-emerald-300" />
              Connecting to metrics stream...
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-4">
              <MetricCard
                label="CPU"
                value={`${metrics.cpu.usage.toFixed(1)}%`}
                detail={`${metrics.cpu.cores} cores`}
                status={
                  metrics.cpu.usage > 85
                    ? "danger"
                    : metrics.cpu.usage > 70
                      ? "warning"
                      : "online"
                }
              >
                <CpuBar usage={metrics.cpu.usage} cores={metrics.cpu.perCore} />
                <Sparkline values={cpuHistory} />
              </MetricCard>

              <MetricCard
                label="Memory"
                value={`${metrics.memory.usage.toFixed(1)}%`}
                detail="active"
                status={
                  metrics.memory.usage > 85
                    ? "danger"
                    : metrics.memory.usage > 70
                      ? "warning"
                      : "online"
                }
              >
                <MemoryBar
                  usage={metrics.memory.usage}
                  used={metrics.memory.used}
                  total={metrics.memory.total}
                />
                <Sparkline values={memoryHistory} />
              </MetricCard>

              <MetricCard
                label="Load Average"
                value={metrics.loadAverage.join(" ")}
                detail="1 5 15"
                status="muted"
              >
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Timer className="size-4 text-cyan-300" />
                  normalized system load window
                </div>
              </MetricCard>

              <MetricCard
                label="Processes"
                value={String(metrics.processCount)}
                detail={`${metrics.processes.length} shown`}
                status="muted"
              >
                <div className="grid gap-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-2">
                    <Server className="size-4 text-emerald-300" />
                    running:{" "}
                    {
                      metrics.processes.filter(
                        (item) => item.status === "running",
                      ).length
                    }
                  </span>
                  <span className="flex items-center gap-2">
                    <HardDrive className="size-4 text-cyan-300" />
                    memory tracked live
                  </span>
                </div>
              </MetricCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
              <ProcessTable
                processes={metrics.processes}
                onKill={handleKillProcess}
              />
              <aside className="grid content-start gap-4">
                <MetricCard
                  label="Network RX"
                  value={formatRate(metrics.network.rxSec)}
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Network className="size-4 text-cyan-300" />
                    inbound across active interfaces
                  </div>
                </MetricCard>
                <MetricCard
                  label="Network TX"
                  value={formatRate(metrics.network.txSec)}
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Activity className="size-4 text-emerald-300" />
                    outbound across active interfaces
                  </div>
                </MetricCard>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
