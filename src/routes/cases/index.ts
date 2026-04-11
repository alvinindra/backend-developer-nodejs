import { Router } from "express"
import { case01HealthRouter } from "./01-health"
import { case02CrudRouter } from "./02-typescript-crud"
import { case03GraphqlRouter } from "./03-graphql"
import { case04PostgresRouter } from "./04-postgres"
import { case04bPostgresTransactionsRouter } from "./04b-postgres-transactions"
import { case05TimescaleRouter } from "./05-timescale"
import { case06HasuraRouter } from "./06-hasura"
import { case07AuthRouter } from "./07-auth"
import { case08MicroservicesRouter } from "./08-microservices"
import { case08bServiceBoundaryRouter } from "./08b-service-boundary"
import { case09QueueWorkerRouter } from "./09-queue-worker"
import { case09bIdempotencyRouter } from "./09b-idempotency"
import { case10ReactDemoRouter } from "./10-react-demo"
import { case11AiMlRouter } from "./11-ai-ml"
import { case12ObservabilityRouter } from "./12-observability"
import { case13CicdGcpRouter } from "./13-cicd-gcp"
import { case14SystemDesignRouter } from "./14-system-design"
import { case15CiCdWebhookRouter } from "./15-ci-cd-webhook"
import { case16ResilienceRouter } from "./16-resilience"
import { case17EventSourcingCqrsRouter } from "./17-event-sourcing-cqrs"

export const casesRouter = Router()

casesRouter.use("/01-health", case01HealthRouter)
casesRouter.use("/02-typescript-crud", case02CrudRouter)
casesRouter.use("/03-graphql", case03GraphqlRouter)
casesRouter.use("/04-postgres", case04PostgresRouter)
casesRouter.use("/04b-postgres-transactions", case04bPostgresTransactionsRouter)
casesRouter.use("/05-timescale", case05TimescaleRouter)
casesRouter.use("/06-hasura", case06HasuraRouter)
casesRouter.use("/07-auth", case07AuthRouter)
casesRouter.use("/08-microservices", case08MicroservicesRouter)
casesRouter.use("/08b-service-boundary", case08bServiceBoundaryRouter)
casesRouter.use("/09-queue-worker", case09QueueWorkerRouter)
casesRouter.use("/09b-idempotency", case09bIdempotencyRouter)
casesRouter.use("/10-react-demo", case10ReactDemoRouter)
casesRouter.use("/11-ai-ml", case11AiMlRouter)
casesRouter.use("/12-observability", case12ObservabilityRouter)
casesRouter.use("/13-cicd-gcp", case13CicdGcpRouter)
casesRouter.use("/14-system-design", case14SystemDesignRouter)
casesRouter.use("/15-ci-cd-webhook", case15CiCdWebhookRouter)
casesRouter.use("/16-resilience", case16ResilienceRouter)
casesRouter.use("/17-event-sourcing-cqrs", case17EventSourcingCqrsRouter)
