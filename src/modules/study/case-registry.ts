export interface StudyCase {
  id: string
  route: string
  title: string
  focus: string
}

export const studyCases: StudyCase[] = [
  {
    id: "01",
    route: "/cases/01-health",
    title: "Health and readiness",
    focus: "Service uptime, request IDs, production-style probes",
  },
  {
    id: "02",
    route: "/cases/02-typescript-crud",
    title: "Type-safe CRUD",
    focus: "REST CRUD with TypeScript models and Zod validation",
  },
  {
    id: "03",
    route: "/cases/03-graphql",
    title: "GraphQL API",
    focus: "Query and mutation patterns with schema-first GraphQL",
  },
  {
    id: "04",
    route: "/cases/04-postgres",
    title: "Postgres fundamentals",
    focus: "Table setup, indexing, inserts, and reads",
  },
  {
    id: "04b",
    route: "/cases/04b-postgres-transactions",
    title: "Postgres transactions",
    focus: "ACID transfer flow with row locks and rollback handling",
  },
  {
    id: "05",
    route: "/cases/05-timescale",
    title: "Timescale time-series",
    focus: "Hypertable setup, metric ingestion, and bucket queries",
  },
  {
    id: "06",
    route: "/cases/06-hasura",
    title: "Hasura integration",
    focus: "Actions and event-trigger webhook handling",
  },
  {
    id: "07",
    route: "/cases/07-auth",
    title: "Auth and RBAC",
    focus: "JWT issuance, protected routes, role checks",
  },
  {
    id: "08",
    route: "/cases/08-microservices",
    title: "Microservice patterns",
    focus: "Outbox-style event publishing and order processing flow",
  },
  {
    id: "08b",
    route: "/cases/08b-service-boundary",
    title: "Service boundary orchestration",
    focus: "Inventory and payment flow with rollback behavior",
  },
  {
    id: "09",
    route: "/cases/09-queue-worker",
    title: "Queue and worker",
    focus: "Retries, dead-letter behavior, async job processing",
  },
  {
    id: "09b",
    route: "/cases/09b-idempotency",
    title: "Idempotent API design",
    focus: "Prevent duplicate processing using idempotency keys",
  },
  {
    id: "10",
    route: "/cases/10-react-demo",
    title: "Frontend touchpoint",
    focus: "Light React integration from the same backend project",
  },
  {
    id: "11",
    route: "/cases/11-ai-ml",
    title: "AI/ML integration",
    focus: "Provider call pattern with resilient fallback summary",
  },
  {
    id: "12",
    route: "/cases/12-observability",
    title: "Observability",
    focus: "Structured logging and end-to-end request correlation",
  },
  {
    id: "13",
    route: "/cases/13-cicd-gcp",
    title: "CI/CD and GCP",
    focus: "Pipeline concepts, Cloud Build flow, Cloud Run deployment",
  },
  {
    id: "14",
    route: "/cases/14-system-design",
    title: "System design",
    focus: "Scalability checklist and reference architecture blueprint",
  },
  {
    id: "15",
    route: "/cases/15-ci-cd-webhook",
    title: "CI/CD webhook security",
    focus: "GitHub webhook signature verification with timing-safe compare",
  },
  {
    id: "16",
    route: "/cases/16-resilience",
    title: "Resilience engineering",
    focus: "Retries, timeouts, circuit breaker, and bulkhead isolation",
  },
  {
    id: "17",
    route: "/cases/17-event-sourcing-cqrs",
    title: "Event sourcing and CQRS",
    focus: "Command handling, append-only events, and projection rebuild",
  },
]
