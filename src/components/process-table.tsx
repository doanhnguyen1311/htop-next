"use client";

import * as React from "react";
import { ArrowDownUp, RotateCcw, Search, ShieldX } from "lucide-react";
import { useDeferredValue, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ProcessStatus, SystemProcess } from "@/types/metrics";

type ProcessTableProps = {
  processes: SystemProcess[];
  onKill: (pid: number) => void;
};

type StatusFilter = "all" | ProcessStatus;
type SortKey = "cpu" | "memory" | "pid" | "name" | "status";
type SortDirection = "asc" | "desc";
type ProcessRow = SystemProcess & {
  pids: number[];
  instances: number;
  grouped: boolean;
};

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Sleeping", value: "sleeping" },
  { label: "Stopped", value: "stopped" },
  { label: "Zombie", value: "zombie" },
];

const sortOptions: Array<{ label: string; value: SortKey }> = [
  { label: "CPU", value: "cpu" },
  { label: "Memory", value: "memory" },
  { label: "PID", value: "pid" },
  { label: "Name", value: "name" },
  { label: "Status", value: "status" },
];

const directionOptions: Array<{ label: string; value: SortDirection }> = [
  { label: "Desc", value: "desc" },
  { label: "Asc", value: "asc" },
];

const limitOptions = [
  { label: "25 rows", value: "25" },
  { label: "50 rows", value: "50" },
  { label: "80 rows", value: "80" },
  { label: "All rows", value: "all" },
];

function statusClassName(status: SystemProcess["status"]) {
  if (status === "running") return "text-emerald-300";
  if (status === "zombie" || status === "stopped") return "text-rose-300";
  return "text-zinc-500";
}

function compareProcesses(
  left: ProcessRow,
  right: ProcessRow,
  sortKey: SortKey,
) {
  if (sortKey === "name" || sortKey === "status") {
    return left[sortKey].localeCompare(right[sortKey]);
  }

  return left[sortKey] - right[sortKey];
}

function matchesQuery(process: ProcessRow, query: string) {
  if (!query) return true;

  return (
    process.name.toLowerCase().includes(query) ||
    process.command.toLowerCase().includes(query) ||
    String(process.pid).includes(query) ||
    process.pids.some((pid) => String(pid).includes(query))
  );
}

function toProcessRow(process: SystemProcess): ProcessRow {
  return {
    ...process,
    pids: [process.pid],
    instances: 1,
    grouped: false,
  };
}

function dominantStatus(statuses: ProcessStatus[]) {
  if (statuses.includes("running")) return "running";
  if (statuses.includes("zombie")) return "zombie";
  if (statuses.includes("stopped")) return "stopped";
  return "sleeping";
}

function groupProcessesByName(processes: SystemProcess[]) {
  const groups = new Map<string, SystemProcess[]>();

  for (const process of processes) {
    const group = groups.get(process.name) ?? [];
    group.push(process);
    groups.set(process.name, group);
  }

  return Array.from(groups.entries()).map(([name, group]): ProcessRow => {
    const sortedGroup = group.toSorted((left, right) => right.cpu - left.cpu);
    const leader = sortedGroup[0];
    const cpu = group.reduce((total, item) => total + item.cpu, 0);
    const memory = group.reduce((total, item) => total + item.memory, 0);
    const pids = group
      .map((item) => item.pid)
      .toSorted((left, right) => left - right);

    return {
      pid: leader.pid,
      pids,
      name,
      cpu,
      memory,
      status: dominantStatus(group.map((item) => item.status)),
      command: group.map((item) => item.command || item.name).join(" | "),
      instances: group.length,
      grouped: true,
    };
  });
}

export const ProcessTable = React.memo(function ProcessTable({
  processes,
  onKill,
}: ProcessTableProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("cpu");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [limit, setLimit] = useState("80");
  const [cpuMin, setCpuMin] = useState("");
  const [cpuMax, setCpuMax] = useState("");
  const [memoryMin, setMemoryMin] = useState("");
  const [memoryMax, setMemoryMax] = useState("");
  const [groupByName, setGroupByName] = useState(false);
  const [pendingKillPids, setPendingKillPids] = useState<number[]>([]);

  const normalizedQuery = useDeferredValue(query.trim().toLowerCase());
  const deferredCpuMin = useDeferredValue(cpuMin);
  const deferredCpuMax = useDeferredValue(cpuMax);
  const deferredMemoryMin = useDeferredValue(memoryMin);
  const deferredMemoryMax = useDeferredValue(memoryMax);

  const ranges = useMemo(
    () => ({
      cpuMin: deferredCpuMin === "" ? null : Number(deferredCpuMin),
      cpuMax: deferredCpuMax === "" ? null : Number(deferredCpuMax),
      memoryMin: deferredMemoryMin === "" ? null : Number(deferredMemoryMin),
      memoryMax: deferredMemoryMax === "" ? null : Number(deferredMemoryMax),
    }),
    [deferredCpuMax, deferredCpuMin, deferredMemoryMax, deferredMemoryMin],
  );

  const filteredProcesses = useMemo(() => {
    const sourceRows = groupByName
      ? groupProcessesByName(processes)
      : processes.map(toProcessRow);

    const nextProcesses = sourceRows
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter((item) => matchesQuery(item, normalizedQuery))
      .filter((item) => {
        const cpuMinValid = ranges.cpuMin === null || item.cpu >= ranges.cpuMin;
        const cpuMaxValid = ranges.cpuMax === null || item.cpu <= ranges.cpuMax;
        const memoryMinValid =
          ranges.memoryMin === null || item.memory >= ranges.memoryMin;
        const memoryMaxValid =
          ranges.memoryMax === null || item.memory <= ranges.memoryMax;

        return cpuMinValid && cpuMaxValid && memoryMinValid && memoryMaxValid;
      })
      .toSorted((left, right) => {
        const result = compareProcesses(left, right, sortKey);
        return sortDirection === "asc" ? result : -result;
      });

    if (limit === "all") return nextProcesses;

    return nextProcesses.slice(0, Number(limit));
  }, [
    limit,
    normalizedQuery,
    processes,
    ranges,
    sortDirection,
    sortKey,
    statusFilter,
    groupByName,
  ]);

  const visibleStats = useMemo(() => {
    const highCpu = filteredProcesses.filter((item) => item.cpu >= 40).length;
    const running = filteredProcesses.filter(
      (item) => item.status === "running",
    ).length;

    return { highCpu, running };
  }, [filteredProcesses]);

  const hasActiveFilters =
    query !== "" ||
    statusFilter !== "all" ||
    sortKey !== "cpu" ||
    sortDirection !== "desc" ||
    limit !== "80" ||
    cpuMin !== "" ||
    cpuMax !== "" ||
    memoryMin !== "" ||
    memoryMax !== "" ||
    groupByName;

  const resetFilters = useCallback(() => {
    setQuery("");
    setStatusFilter("all");
    setSortKey("cpu");
    setSortDirection("desc");
    setLimit("80");
    setCpuMin("");
    setCpuMax("");
    setMemoryMin("");
    setMemoryMax("");
    setGroupByName(false);
  }, []);

  const handleKill = useCallback(
    (pids: number[]) => {
      setPendingKillPids(pids);

      for (const pid of pids) {
        onKill(pid);
      }

      window.setTimeout(() => {
        setPendingKillPids((currentPids) =>
          currentPids.some((pid) => pids.includes(pid)) ? [] : currentPids,
        );
      }, 1200);
    },
    [onKill],
  );

  return (
    <section className="overflow-hidden rounded-md border border-emerald-400/20 bg-zinc-950/90">
      <div className="flex flex-col gap-4 border-b border-emerald-400/20 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-mono text-sm font-semibold tracking-[0.18em] text-emerald-300 uppercase">
              Process Table
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Showing {filteredProcesses.length} of {processes.length}{" "}
              processes. Running: {visibleStats.running}. High CPU:{" "}
              {visibleStats.highCpu}.
            </p>
          </div>

          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-600" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter pid, name, command..."
              className="border-emerald-400/20 bg-black/40 pl-9 font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[180px_180px_140px_140px_auto] lg:items-end">
          <Select
            label="Status"
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            triggerClassName="border-emerald-400/20 bg-black/40 font-mono text-xs"
            options={statusOptions}
          />

          <Select
            label="Sort by"
            value={sortKey}
            onValueChange={(value) => setSortKey(value as SortKey)}
            triggerClassName="border-emerald-400/20 bg-black/40 font-mono text-xs"
            options={sortOptions}
          />

          <Select
            label="Order"
            value={sortDirection}
            onValueChange={(value) => setSortDirection(value as SortDirection)}
            triggerClassName="border-emerald-400/20 bg-black/40 font-mono text-xs"
            options={directionOptions}
          />

          <Select
            label="Limit"
            value={limit}
            onValueChange={setLimit}
            triggerClassName="border-emerald-400/20 bg-black/40 font-mono text-xs"
            options={limitOptions}
          />

          <Button
            type="button"
            variant="outline"
            className="border-emerald-400/20 bg-black/30 font-mono text-xs text-zinc-300"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-400/20 bg-black/30 px-3 py-2">
          <div>
            <Label htmlFor="group-by-name">Group same process name</Label>
            <p className="mt-1 text-xs text-zinc-500">
              Combine duplicated process names into one row and sum CPU/RAM.
            </p>
          </div>
          <Switch
            id="group-by-name"
            checked={groupByName}
            onCheckedChange={setGroupByName}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="cpu-min">CPU min %</Label>
            <Input
              id="cpu-min"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={cpuMin}
              onChange={(event) => setCpuMin(event.target.value)}
              placeholder="0"
              className="border-emerald-400/20 bg-black/40 font-mono text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cpu-max">CPU max %</Label>
            <Input
              id="cpu-max"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={cpuMax}
              onChange={(event) => setCpuMax(event.target.value)}
              placeholder="100"
              className="border-emerald-400/20 bg-black/40 font-mono text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ram-min">RAM min %</Label>
            <Input
              id="ram-min"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={memoryMin}
              onChange={(event) => setMemoryMin(event.target.value)}
              placeholder="0"
              className="border-emerald-400/20 bg-black/40 font-mono text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ram-max">RAM max %</Label>
            <Input
              id="ram-max"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={memoryMax}
              onChange={(event) => setMemoryMax(event.target.value)}
              placeholder="100"
              className="border-emerald-400/20 bg-black/40 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="max-h-[58vh] overflow-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead className="sticky top-0 z-10 bg-zinc-950 text-zinc-500">
            <tr className="border-b border-emerald-400/20">
              <th className="px-3 py-2 text-left font-medium">PID</th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              {groupByName ? (
                <th className="px-3 py-2 text-right font-medium">Count</th>
              ) : null}
              <th className="px-3 py-2 text-right font-medium">
                <span className="inline-flex items-center gap-1">
                  CPU%
                  {sortKey === "cpu" ? (
                    <ArrowDownUp className="size-3" />
                  ) : null}
                </span>
              </th>
              <th className="px-3 py-2 text-right font-medium">
                <span className="inline-flex items-center gap-1">
                  MEM%
                  {sortKey === "memory" ? (
                    <ArrowDownUp className="size-3" />
                  ) : null}
                </span>
              </th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.map((item) => {
              const killPending = item.pids.some((pid) =>
                pendingKillPids.includes(pid),
              );

              return (
                <tr
                  key={`${item.pid}-${item.name}`}
                  className={cn(
                    "border-b border-zinc-900 transition-colors hover:bg-emerald-400/5",
                    item.cpu >= 40 && "bg-rose-500/10 text-rose-100",
                  )}
                >
                  <td className="px-3 py-2 text-zinc-400">
                    {item.grouped ? `${item.pid}+` : item.pid}
                  </td>
                  <td className="max-w-[320px] truncate px-3 py-2 text-zinc-100">
                    <span title={item.command || item.name}>
                      {item.name}
                      {item.grouped ? (
                        <span className="ml-2 text-zinc-500">
                          ({item.pids.length} pids)
                        </span>
                      ) : null}
                    </span>
                  </td>
                  {groupByName ? (
                    <td className="px-3 py-2 text-right text-zinc-400 tabular-nums">
                      {item.instances}
                    </td>
                  ) : null}
                  <td
                    className={cn(
                      "px-3 py-2 text-right text-emerald-300 tabular-nums",
                      item.cpu >= 40 && "font-semibold text-rose-300",
                    )}
                  >
                    {item.cpu.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right text-cyan-300 tabular-nums">
                    {item.memory.toFixed(1)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 tracking-wide uppercase",
                      statusClassName(item.status),
                    )}
                  >
                    {item.status}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 font-mono text-[11px] text-zinc-500 hover:text-rose-300"
                      onClick={() => handleKill(item.pids)}
                      disabled={killPending}
                    >
                      <ShieldX className="size-3" />
                      {killPending
                        ? "sent"
                        : item.grouped
                          ? `kill ${item.instances}`
                          : "kill"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProcesses.length === 0 ? (
          <div className="p-10 text-center font-mono text-sm text-zinc-500">
            No matching processes.
          </div>
        ) : null}
      </div>
    </section>
  );
});
