import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "barterly_" });

const httpRequestCounter = new client.Counter({
  name: "barterly_http_request_total",
  help: "Total numbers of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new client.Histogram({
  name: "barterly_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const registeredUsers = new client.Gauge({
  name: "barterly_registered_users_total",
  help: "Total number of registered users",
});

const emailQueueSize = new client.Gauge({
  name: "barterly_email_queue_size",
  help: "Number of pending emails in RabbitMQ queue",
});

export {
  client,
  httpRequestCounter,
  httpRequestDuration,
  registeredUsers,
  emailQueueSize,
};
