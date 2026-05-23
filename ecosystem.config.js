module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "start",
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "metrics-server",
      script: "server/metrics-server.mjs",
      interpreter: "node",
      env: {
        METRICS_PORT: 3001,
        METRICS_INTERVAL_MS: 1000,
      },
    },
  ],
};
