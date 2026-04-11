import dotenv from "dotenv"

dotenv.config()

export const env = {
  port: Number(process.env.PORT ?? 3000),
  workerId: process.env.WORKER_ID ?? "worker-1",
  workerPollIntervalMs: Number(process.env.WORKER_POLL_INTERVAL_MS ?? 1500),
  workerRetryDelaySeconds: Number(process.env.WORKER_RETRY_DELAY_SECONDS ?? 3),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/studylab",
  hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET ?? "hasura-dev-secret",
  logFormat: process.env.LOG_FORMAT,
  aiProviderUrl: process.env.AI_PROVIDER_URL,
  aiProviderKey: process.env.AI_PROVIDER_KEY,
  githubWebhookSecret:
    process.env.GITHUB_WEBHOOK_SECRET ?? "webhook-dev-secret",
}
