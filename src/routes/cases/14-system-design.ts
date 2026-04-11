import { Router } from "express";

const scalingChecklist = [
  "Use horizontal pod autoscaling with CPU and latency metrics",
  "Introduce read replicas for heavy read traffic",
  "Use Redis for hot-cache and short-lived sessions",
  "Move long-running work to queue workers",
  "Apply circuit breaker and timeout policies for service calls"
];

const architectureTemplate = {
  apiGateway: "Ingress + API service",
  services: ["user-service", "order-service", "billing-service", "notification-worker"],
  dataStores: ["Postgres", "TimescaleDB", "Redis"],
  messaging: ["Pub/Sub or Kafka topic for domain events"],
  observability: ["structured logs", "traces", "metrics dashboards"]
};

export const case14SystemDesignRouter = Router();

case14SystemDesignRouter.get("/scaling-checklist", (_req, res) => {
  res.json({
    case: "14-system-design",
    checklist: scalingChecklist
  });
});

case14SystemDesignRouter.get("/architecture-template", (_req, res) => {
  res.json({
    case: "14-system-design",
    architectureTemplate
  });
});
