export type ProcessStatus = "running" | "sleeping" | "zombie" | "stopped";

export type SystemProcess = {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: ProcessStatus;
  command: string;
};

export type SystemMetrics = {
  timestamp: number;
  host: string;
  uptime: number;
  cpu: {
    usage: number;
    cores: number;
    perCore: Array<{ id: number; usage: number }>;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  loadAverage: [number, number, number];
  processCount: number;
  network: {
    rxSec: number;
    txSec: number;
  };
  processes: SystemProcess[];
};

export type MetricsConnectionState = "connecting" | "online" | "offline";
