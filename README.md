# Web Htop

Realtime htop-inspired system monitoring dashboard built with Next.js App Router, TypeScript, Tailwind CSS v4, and a small Node.js WebSocket metrics server.

## Features

- Live CPU usage with per-core bars
- Live memory usage
- Load average: 1m, 5m, 15m
- Total process count
- Realtime process table with PID, name, CPU, memory, and status
- Search/filter process list
- High CPU process highlighting
- Connection status and auto-refresh indicator
- Network RX/TX panel
- Mock kill-process action over WebSocket

## Scripts

```bash
npm run dev       # Next.js app only
npm run monitor   # WebSocket metrics server on ws://localhost:3001/metrics
npm run dev:all   # Next.js + metrics server together
npm run build
npm run lint
npm run format
```

Open `http://localhost:3000`.

## Configuration

The browser connects to `https://top.dn203.dpdns.org/metrics` by default. The app converts `https://` to `wss://` when opening the WebSocket connection.

Override it with:

```bash
NEXT_PUBLIC_METRICS_WS_URL=https://top.dn203.dpdns.org/metrics
METRICS_PORT=3001
METRICS_INTERVAL_MS=1000
ENABLE_REAL_KILL=true
```

`ENABLE_REAL_KILL` defaults to disabled. When set to `true`, the kill action sends `SIGTERM` to the selected PID. The server refuses invalid PIDs, PID `1`, its own process, its parent process, and a short list of protected system process names.

## Structure

```text
server/metrics-server.mjs
src/app/page.tsx
src/components/cpu-bar.tsx
src/components/memory-bar.tsx
src/components/metric-card.tsx
src/components/process-table.tsx
src/components/web-htop-dashboard.tsx
src/lib/ws.ts
src/lib/utils.ts
src/types/metrics.ts
```
