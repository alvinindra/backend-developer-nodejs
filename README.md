# Backend Developer Node.js Study Lab

Single-project, backend-first learning workspace based on your target role requirements.

## Tech stack

- Node.js + TypeScript
- Express REST APIs
- GraphQL (`/cases/03-graphql`)
- Postgres + TimescaleDB
- Hasura action/event webhook examples
- JWT auth + RBAC
- Microservice and queue simulations
- CI/CD examples (GitHub Actions and CircleCI)
- Kubernetes deployment templates
- Cloud Build + Cloud Run deployment file (`cloudbuild.yaml`)

## Project goals

- One folder
- One `package.json`
- One `node_modules`
- Many route-based study cases

Current total: **20 study cases**.

## Quick start

```bash
cp .env.example .env
npm install
npm run db:up
npm run dev
npm run dev:worker
```

Or one command bootstrap:

```bash
npm run bootstrap
npm run dev
npm run dev:worker
```

Server runs at `http://localhost:3000`.

## Study routes

- `GET /cases/01-health`
- `GET|POST|PATCH|DELETE /cases/02-typescript-crud`
- `POST /cases/03-graphql` (GraphiQL also enabled)
- `POST /cases/04-postgres/setup`
- `POST /cases/04-postgres/users`
- `GET /cases/04-postgres/users`
- `POST /cases/04b-postgres-transactions/setup`
- `POST /cases/04b-postgres-transactions/transfer`
- `GET /cases/04b-postgres-transactions/balances`
- `POST /cases/05-timescale/setup`
- `POST /cases/05-timescale/metrics`
- `GET /cases/05-timescale/query`
- `POST /cases/06-hasura/action/greet`
- `POST /cases/06-hasura/event/order-created`
- `POST /cases/07-auth/login`
- `GET /cases/07-auth/profile`
- `GET /cases/07-auth/admin`
- `POST /cases/08-microservices/orders`
- `POST /cases/08-microservices/process-outbox`
- `GET /cases/08-microservices/state`
- `POST /cases/08b-service-boundary/checkout`
- `GET /cases/08b-service-boundary/inventory`
- `POST /cases/09-queue-worker/enqueue`
- `POST /cases/09-queue-worker/process`
- `GET /cases/09-queue-worker/stats`
- `POST /cases/09b-idempotency/payment`
- `GET /cases/09b-idempotency/store`
- `GET /cases/10-react-demo`
- `POST /cases/11-ai-ml/summarize`
- `GET /cases/12-observability`
- `GET /cases/13-cicd-gcp`
- `GET /cases/14-system-design/scaling-checklist`
- `GET /cases/14-system-design/architecture-template`
- `POST /cases/15-ci-cd-webhook/github`
- `POST /cases/15-ci-cd-webhook/signature/generate`
- `POST /cases/16-resilience/invoke`
- `GET /cases/16-resilience/state`
- `POST /cases/16-resilience/reset`
- `POST /cases/17-event-sourcing-cqrs/accounts`
- `POST /cases/17-event-sourcing-cqrs/accounts/:accountId/deposit`
- `POST /cases/17-event-sourcing-cqrs/accounts/:accountId/withdraw`
- `GET /cases/17-event-sourcing-cqrs/accounts/:accountId`
- `GET /cases/17-event-sourcing-cqrs/events`
- `POST /cases/17-event-sourcing-cqrs/rebuild-projections`
- `POST /cases/17-event-sourcing-cqrs/reset`

## Scripts

- `npm run dev` - run in watch mode
- `npm run dev:worker` - run worker process in watch mode
- `npm run dev:all` - run API and worker together
- `npm run build` - compile TypeScript
- `npm run start` - run compiled server
- `npm run start:worker` - run compiled worker
- `npm run test` - run tests
- `npm run lint` - TypeScript type-check
- `npm run test:smoke` - quick endpoint smoke checks (requires running server)
- `npm run bootstrap` - install, prepare env, start db+hasura
- `npm run db:up` - start TimescaleDB and Hasura
- `npm run db:down` - stop local containers

## CI/CD and infra

- GitHub Actions: `.github/workflows/ci.yml`
- CircleCI: `.circleci/config.yml`
- Kubernetes templates: `k8s/`
- Hasura starter metadata/migrations: `hasura/`
- GCP build/deploy starter: `cloudbuild.yaml`
- OpenAPI spec: `docs/openapi.yaml` (served at `/docs/openapi.yaml`)
- Interactive API docs: `/docs/openapi` (Stoplight Elements)
- Hasura setup walkthrough: `docs/hasura-setup.md`
- GCP deployment walkthrough: `docs/gcp-deployment.md`
- Postman collection: `docs/postman-collection.json`

## Notes

- Cases `04`, `05`, `08`, and `09` require database running.
- Cases `08` and `09` are now backed by DB tables and can be processed by a separate worker process.
- Case `11` works without external AI service using local fallback summary.
- Case `15` verifies GitHub signatures against raw request bytes, matching production webhook behavior.
- API server and worker now handle `SIGINT`/`SIGTERM` gracefully and close DB pools before exit.
- Logs are pretty and human-readable by default in development, with per-request access logs.
- Set `LOG_FORMAT=json` if you want structured JSON logs (useful for log aggregation pipelines).

## Suggested completion checklist

1. Run all app-level checks: `npm run lint && npm run test && npm run build`
2. Start infra: `npm run db:up`
3. Start API: `npm run dev`
4. Start worker: `npm run dev:worker`
5. Visit docs endpoint: `http://localhost:3000/docs/study-cases`
6. Open interactive API docs: `http://localhost:3000/docs/openapi`
7. Execute case routes in `docs/study-cases.md` from 01 to 17

## Separate process flow for case 08 and case 09

1. `POST /cases/08-microservices/setup`
2. `POST /cases/09-queue-worker/setup`
3. `POST /cases/08-microservices/orders` and `POST /cases/09-queue-worker/enqueue`
4. Worker (`npm run dev:worker`) auto-processes outbox and queue jobs
5. Verify using `GET /cases/08-microservices/state` and `GET /cases/09-queue-worker/stats`
