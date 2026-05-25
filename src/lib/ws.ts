import type { SystemMetrics } from "@/types/metrics";

export type KillAck = {
  pid: number;
  killed: boolean;
  mocked: boolean;
  message: string;
};

type MetricsMessage =
  | { type: "metrics"; data: SystemMetrics }
  | { type: "error"; message: string }
  | { type: "hello"; data: { intervalMs: number } }
  | {
      type: "kill_ack";
      data: KillAck;
    };

type MetricsHandler = (metrics: SystemMetrics) => void;
type StatusHandler = (online: boolean) => void;
type ErrorHandler = (message: string) => void;
type KillAckHandler = (ack: KillAck) => void;
type IntervalHandler = (intervalMs: number) => void;

export type MetricsSocket = {
  close: () => void;
  killProcess: (pid: number) => void;
};

function toWebSocketUrl(url: string): string {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol === "https:") {
    parsedUrl.protocol = "wss:";
  }

  if (parsedUrl.protocol === "http:") {
    parsedUrl.protocol = "ws:";
  }

  return parsedUrl.toString();
}

export function createMetricsSocket({
  onMetrics,
  onStatus,
  onError,
  onKillAck,
  onInterval,
}: {
  onMetrics: MetricsHandler;
  onStatus: StatusHandler;
  onError: ErrorHandler;
  onKillAck?: KillAckHandler;
  onInterval?: IntervalHandler;
}): MetricsSocket {
  const url = toWebSocketUrl(
    process.env.NEXT_PUBLIC_METRICS_WS_URL ??
      "https://top.dn203.dpdns.org/metrics",
  );
  const debugEnabled = process.env.NEXT_PUBLIC_METRICS_DEBUG === "true";
  let socket: WebSocket | null = null;
  let closed = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    socket = new WebSocket(url);
    if (debugEnabled) {
      console.info("[metrics:connect]", { url });
    }
    onStatus(false);

    socket.addEventListener("open", () => {
      if (debugEnabled) {
        console.info("[metrics:open]", { url });
      }
      onStatus(true);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data as string) as MetricsMessage;

      if (debugEnabled) {
        if (message.type === "metrics") {
          console.info("[metrics:message]", {
            type: message.type,
            timestamp: message.data.timestamp,
            cpu: message.data.cpu.usage,
            memory: message.data.memory.usage,
            processCount: message.data.processCount,
            topProcesses: message.data.processes.slice(0, 5),
          });
        } else {
          console.info("[metrics:message]", message);
        }
      }

      if (message.type === "metrics") {
        onMetrics(message.data);
        return;
      }

      if (message.type === "error") {
        onError(message.message);
        return;
      }

      if (message.type === "hello") {
        onInterval?.(message.data.intervalMs);
        return;
      }

      if (message.type === "kill_ack") {
        onKillAck?.(message.data);
      }
    });

    socket.addEventListener("close", () => {
      if (debugEnabled) {
        console.info("[metrics:close]");
      }
      onStatus(false);

      if (!closed) {
        retryTimer = setTimeout(connect, 1500);
      }
    });

    socket.addEventListener("error", () => {
      if (debugEnabled) {
        console.error("[metrics:error]");
      }
      onStatus(false);
      onError("Metrics WebSocket connection failed.");
    });
  };

  connect();

  return {
    close: () => {
      closed = true;

      if (retryTimer) {
        clearTimeout(retryTimer);
      }

      socket?.close();
    },
    killProcess: (pid: number) => {
      if (socket?.readyState === WebSocket.OPEN) {
        if (debugEnabled) {
          console.info("[metrics:kill_send]", { pid });
        }
        socket.send(JSON.stringify({ type: "kill", pid }));
      }
    },
  };
}
