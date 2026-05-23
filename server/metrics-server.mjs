import http from "node:http";
import os from "node:os";
import process from "node:process";
import nextEnv from "@next/env";
import si from "systeminformation";
import { WebSocketServer } from "ws";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const port = Number(process.env.METRICS_PORT ?? 3001);
const intervalMs = Number(process.env.METRICS_INTERVAL_MS ?? 5000);
const realKillEnabled = process.env.ENABLE_REAL_KILL === "true";
const debugEnabled = process.env.METRICS_DEBUG === "true";
const protectedPids = new Set(
  [0, 1, process.pid, process.ppid].filter(Boolean),
);
const protectedProcessNames = new Set([
  "systemd",
  "init",
  "kernel_task",
  "launchd",
]);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, path: "/metrics" });

function debugLog(label, data) {
  if (!debugEnabled) return;

  console.log(
    `[metrics:${label}]`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        ...data,
      },
      null,
      2,
    ),
  );
}

function normalizeStatus(state = "") {
  const lower = state.toLowerCase();

  if (lower.includes("run")) return "running";
  if (lower.includes("sleep") || lower.includes("idle")) return "sleeping";
  if (lower.includes("zombie")) return "zombie";
  if (lower.includes("stop")) return "stopped";

  return "sleeping";
}

function isValidPid(pid) {
  return Number.isInteger(pid) && pid > 1;
}

async function killProcess(pid) {
  if (!isValidPid(pid)) {
    return {
      killed: false,
      mocked: !realKillEnabled,
      message: "Invalid PID.",
    };
  }

  if (!realKillEnabled) {
    debugLog("kill_mocked", { pid });

    return {
      killed: false,
      mocked: true,
      message:
        "Kill process is mocked. Set ENABLE_REAL_KILL=true to enable SIGTERM.",
    };
  }

  if (protectedPids.has(pid)) {
    debugLog("kill_refused", { pid, reason: "protected_pid" });

    return {
      killed: false,
      mocked: false,
      message: "Refused to kill a protected PID.",
    };
  }

  const processes = await si.processes();
  const target = processes.list.find((item) => item.pid === pid);

  if (!target) {
    debugLog("kill_refused", { pid, reason: "not_found" });

    return {
      killed: false,
      mocked: false,
      message: "Process not found.",
    };
  }

  const targetName = (target.name || target.command || "").toLowerCase();

  if (protectedProcessNames.has(targetName)) {
    debugLog("kill_refused", {
      pid,
      name: targetName,
      reason: "protected_process_name",
    });

    return {
      killed: false,
      mocked: false,
      message: `Refused to kill protected process "${targetName}".`,
    };
  }

  process.kill(pid, "SIGTERM");
  debugLog("kill_sent", {
    pid,
    name: targetName,
    signal: "SIGTERM",
  });

  return {
    killed: true,
    mocked: false,
    message: `SIGTERM sent to PID ${pid}.`,
  };
}

async function collectMetrics() {
  const [load, memory, processes, network] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.processes(),
    si.networkStats().catch(() => []),
  ]);

  const networkStats = Array.isArray(network) ? network : [];
  const rxSec = networkStats.reduce(
    (total, item) => total + (item.rx_sec || 0),
    0,
  );
  const txSec = networkStats.reduce(
    (total, item) => total + (item.tx_sec || 0),
    0,
  );

  return {
    timestamp: Date.now(),
    host: os.hostname(),
    uptime: os.uptime(),
    cpu: {
      usage: Number(load.currentLoad.toFixed(1)),
      cores: os.cpus().length,
      perCore: load.cpus.map((cpu, index) => ({
        id: index,
        usage: Number(cpu.load.toFixed(1)),
      })),
    },
    memory: {
      total: memory.total,
      used: memory.active,
      free: memory.available,
      usage: Number(((memory.active / memory.total) * 100).toFixed(1)),
    },
    loadAverage: os.loadavg().map((value) => Number(value.toFixed(2))),
    processCount: processes.all,
    network: {
      rxSec,
      txSec,
    },
    processes: processes.list
      .map((item) => ({
        pid: item.pid,
        name: item.name || item.command || "unknown",
        cpu: Number((item.cpu || 0).toFixed(1)),
        memory: Number((item.mem || 0).toFixed(1)),
        status: normalizeStatus(item.state),
        command: item.command || item.name || "",
      }))
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 80),
  };
}

async function broadcastMetrics() {
  if (wss.clients.size === 0) return;

  try {
    const metrics = await collectMetrics();

    debugLog("snapshot", {
      clients: wss.clients.size,
      cpu: metrics.cpu.usage,
      memory: metrics.memory.usage,
      loadAverage: metrics.loadAverage,
      processCount: metrics.processCount,
      topProcesses: metrics.processes.slice(0, 5).map((item) => ({
        pid: item.pid,
        name: item.name,
        cpu: item.cpu,
        memory: item.memory,
        status: item.status,
      })),
    });

    const payload = JSON.stringify({
      type: "metrics",
      data: metrics,
    });

    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }
  } catch (error) {
    const payload = JSON.stringify({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown metrics error",
    });

    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }
  }
}

wss.on("connection", async (socket) => {
  debugLog("connection", { clients: wss.clients.size });

  socket.on("message", async (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      debugLog("message_in", message);

      if (message.type === "kill") {
        const pid = Number(message.pid);
        const result = await killProcess(pid);

        const ack = {
          type: "kill_ack",
          data: {
            pid,
            ...result,
          },
        };

        debugLog("message_out", ack);
        socket.send(JSON.stringify(ack));
      }
    } catch (error) {
      socket.send(
        JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Invalid message",
        }),
      );
    }
  });

  socket.send(JSON.stringify({ type: "hello", data: { intervalMs } }));

  try {
    const metrics = await collectMetrics();

    debugLog("initial_snapshot", {
      cpu: metrics.cpu.usage,
      memory: metrics.memory.usage,
      processCount: metrics.processCount,
      topProcesses: metrics.processes.slice(0, 5).map((item) => ({
        pid: item.pid,
        name: item.name,
        cpu: item.cpu,
        memory: item.memory,
        status: item.status,
      })),
    });

    socket.send(JSON.stringify({ type: "metrics", data: metrics }));
  } catch {
    socket.send(
      JSON.stringify({ type: "error", message: "Initial metrics failed" }),
    );
  }
});

const timer = setInterval(broadcastMetrics, intervalMs);

server.listen(port, () => {
  console.log(
    `Web Htop metrics server listening on ws://localhost:${port}/metrics`,
  );
  console.log(
    `Real kill mode: ${realKillEnabled ? "enabled" : "disabled (mock only)"}`,
  );
  console.log(`Metrics interval: ${intervalMs}ms`);
  console.log(`Metrics debug logs: ${debugEnabled ? "enabled" : "disabled"}`);
});

function shutdown() {
  clearInterval(timer);
  wss.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
